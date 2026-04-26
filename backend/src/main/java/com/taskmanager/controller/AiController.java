package com.taskmanager.controller;

import com.taskmanager.dto.AiRequest;
import com.taskmanager.dto.AiResponse;
import com.taskmanager.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/ai")
@RequiredArgsConstructor
public class AiController {

    private final GeminiService geminiService;

    @PostMapping("/ask")
    public ResponseEntity<AiResponse> ask(
            @PathVariable Long projectId,
            @Valid @RequestBody AiRequest request) {
        try {
            String answer = geminiService.ask(projectId, request.getQuestion());
            return ResponseEntity.ok(new AiResponse(answer));
        } catch (Exception e) {
            return ResponseEntity.ok(new AiResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/standup")
    public ResponseEntity<AiResponse> standup(@PathVariable Long projectId) {
        try {
            String report = geminiService.generateStandup(projectId);
            return ResponseEntity.ok(new AiResponse(report));
        } catch (Exception e) {
            return ResponseEntity.ok(new AiResponse("Error generating standup: " + e.getMessage()));
        }
    }
}
