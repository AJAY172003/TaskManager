package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<TaskResponse> getByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    public TaskResponse getById(Long id) {
        return toResponse(taskRepository.findById(id).orElseThrow());
    }

    public TaskResponse create(Long projectId, TaskRequest req) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        Task task = Task.builder()
                .title(req.getTitle()).description(req.getDescription())
                .dueDate(req.getDueDate()).project(project).build();
        if (req.getPriority() != null) task.setPriority(Task.Priority.valueOf(req.getPriority()));
        if (req.getStatus() != null) task.setStatus(Task.Status.valueOf(req.getStatus()));
        if (req.getAssigneeId() != null)
            task.setAssignee(userRepository.findById(req.getAssigneeId()).orElse(null));
        return toResponse(taskRepository.save(task));
    }

    public TaskResponse update(Long id, TaskRequest req) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setDueDate(req.getDueDate());
        if (req.getPriority() != null) task.setPriority(Task.Priority.valueOf(req.getPriority()));
        if (req.getStatus() != null) task.setStatus(Task.Status.valueOf(req.getStatus()));
        if (req.getAssigneeId() != null)
            task.setAssignee(userRepository.findById(req.getAssigneeId()).orElse(null));
        return toResponse(taskRepository.save(task));
    }

    public void delete(Long id) { taskRepository.deleteById(id); }

    private TaskResponse toResponse(Task t) {
        return TaskResponse.builder()
                .id(t.getId()).title(t.getTitle()).description(t.getDescription())
                .priority(t.getPriority().name()).status(t.getStatus().name())
                .dueDate(t.getDueDate()).createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt())
                .projectId(t.getProject().getId()).projectName(t.getProject().getName())
                .assigneeId(t.getAssignee() != null ? t.getAssignee().getId() : null)
                .assigneeName(t.getAssignee() != null ? t.getAssignee().getName() : null)
                .build();
    }
}
