package com.taskmanager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.model.Task;
import com.taskmanager.model.Project;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    // ─── GENERAL Q&A ──────────────────────────────────────────────────────────
    public String ask(Long projectId, String question) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        String context = buildProjectContext(project, tasks);
        String prompt = """
                You are an intelligent project management assistant.
                Use ONLY the project data provided below to answer the user's question.
                Be concise, helpful, and specific. If you cannot answer from the data, say so.
                
                """ + context + """
                
                USER QUESTION: """ + question + """
                
                ANSWER:""";

        return callGemini(prompt);
    }

    // ─── STANDUP GENERATOR ────────────────────────────────────────────────────
    public String generateStandup(Long projectId) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Retrieve all relevant task data
        List<Task> allTasks        = taskRepository.findByProjectId(projectId);
        List<Task> recentTasks     = taskRepository.findRecentlyUpdated(projectId, LocalDateTime.now().minusHours(24));
        List<Task> overdueTasks    = taskRepository.findOverdueTasks(projectId);
        List<Task> inProgressTasks = allTasks.stream()
                .filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).toList();
        List<Task> todoTasks       = allTasks.stream()
                .filter(t -> t.getStatus() == Task.Status.TODO).toList();
        List<Task> doneTasks       = allTasks.stream()
                .filter(t -> t.getStatus() == Task.Status.DONE).toList();
        List<Task> unassigned      = allTasks.stream()
                .filter(t -> t.getAssignee() == null && t.getStatus() != Task.Status.DONE).toList();

        // Build rich context for Gemini
        StringBuilder context = new StringBuilder();
        context.append("PROJECT: ").append(project.getName()).append("\n");
        context.append("Date: ").append(LocalDate.now()).append("\n\n");

        context.append("=== TASKS UPDATED IN LAST 24 HOURS (").append(recentTasks.size()).append(") ===\n");
        if (recentTasks.isEmpty()) {
            context.append("No tasks were updated in the last 24 hours.\n");
        } else {
            for (Task t : recentTasks) {
                context.append("- [").append(t.getStatus()).append("] ").append(t.getTitle())
                       .append(" | Assignee: ").append(t.getAssignee() != null ? t.getAssignee().getName() : "Unassigned")
                       .append("\n");
            }
        }

        context.append("\n=== CURRENTLY IN PROGRESS (").append(inProgressTasks.size()).append(") ===\n");
        for (Task t : inProgressTasks) {
            context.append("- ").append(t.getTitle())
                   .append(" | Assignee: ").append(t.getAssignee() != null ? t.getAssignee().getName() : "Unassigned")
                   .append(" | Due: ").append(t.getDueDate() != null ? t.getDueDate() : "No date")
                   .append("\n");
        }

        context.append("\n=== COMPLETED (DONE) TASKS (").append(doneTasks.size()).append(") ===\n");
        for (Task t : doneTasks) {
            context.append("- ").append(t.getTitle()).append("\n");
        }

        context.append("\n=== OVERDUE TASKS (").append(overdueTasks.size()).append(") ===\n");
        if (overdueTasks.isEmpty()) {
            context.append("No overdue tasks.\n");
        } else {
            for (Task t : overdueTasks) {
                context.append("- [").append(t.getPriority()).append("] ").append(t.getTitle())
                       .append(" | Due: ").append(t.getDueDate())
                       .append(" | Assignee: ").append(t.getAssignee() != null ? t.getAssignee().getName() : "UNASSIGNED")
                       .append("\n");
            }
        }

        context.append("\n=== UNASSIGNED TASKS (").append(unassigned.size()).append(") ===\n");
        for (Task t : unassigned) {
            context.append("- [").append(t.getPriority()).append("] ").append(t.getTitle()).append("\n");
        }

        context.append("\n=== SUMMARY ===\n");
        context.append("Total: ").append(allTasks.size())
               .append(" | Todo: ").append(todoTasks.size())
               .append(" | In Progress: ").append(inProgressTasks.size())
               .append(" | Done: ").append(doneTasks.size())
               .append(" | Overdue: ").append(overdueTasks.size())
               .append("\n");

        String prompt = """
                You are a project management assistant generating a daily standup report.
                Based on the project data below, write a professional standup report with exactly these 4 sections:

                🟢 YESTERDAY
                List what was completed or updated in the last 24 hours.

                🔵 TODAY
                List what is currently in progress and what should be worked on next.

                🔴 BLOCKERS
                List overdue tasks, unassigned tasks, and any risks. Be specific about who is affected.

                📊 QUICK STATS
                One line summary with numbers (total, done, in progress, overdue).

                Use bullet points. Be concise and professional. Use actual task names from the data.
                If a section has nothing to report, say "Nothing to report."

                PROJECT DATA:
                """ + context + """
                
                Generate the standup report now:""";

        return callGemini(prompt);
    }

    // ─── SHARED HELPERS ───────────────────────────────────────────────────────
    private String buildProjectContext(Project project, List<Task> tasks) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("PROJECT: ").append(project.getName()).append("\n");
        ctx.append("Status: ").append(project.getStatus()).append("\n");
        ctx.append("Description: ").append(project.getDescription() != null ? project.getDescription() : "N/A").append("\n\n");
        ctx.append("TASKS:\n");
        for (Task t : tasks) {
            ctx.append("- [").append(t.getStatus()).append("] [").append(t.getPriority()).append("] ")
               .append(t.getTitle())
               .append(" | Due: ").append(t.getDueDate() != null ? t.getDueDate() : "None")
               .append(" | Assignee: ").append(t.getAssignee() != null ? t.getAssignee().getName() : "Unassigned")
               .append("\n");
        }
        long done = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        ctx.append("\nTotal: ").append(tasks.size()).append(" | Done: ").append(done);
        return ctx.toString();
    }

    private String callGemini(String prompt) throws Exception {
        String escaped = prompt.replace("\\", "\\\\")
                               .replace("\"", "\\\"")
                               .replace("\n", "\\n")
                               .replace("\r", "\\r")
                               .replace("\t", "\\t");

        String requestBody = "{\"contents\":[{\"parts\":[{\"text\":\"" + escaped + "\"}]}]}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_URL + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode root = objectMapper.readTree(response.body());
        return root.path("candidates")
                   .path(0)
                   .path("content")
                   .path("parts")
                   .path(0)
                   .path("text")
                   .asText("Sorry, I could not generate a response.");
    }
}
