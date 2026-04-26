package com.taskmanager.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long ownerId;
    private String ownerName;
    private int taskCount;
}
