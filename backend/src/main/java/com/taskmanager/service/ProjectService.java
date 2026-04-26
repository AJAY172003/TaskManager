package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public List<ProjectResponse> getMyProjects() {
        return projectRepository.findByOwnerId(currentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    public ProjectResponse getById(Long id) {
        return toResponse(projectRepository.findById(id).orElseThrow());
    }

    public ProjectResponse create(ProjectRequest req) {
        Project p = Project.builder()
                .name(req.getName()).description(req.getDescription())
                .owner(currentUser()).build();
        if (req.getStatus() != null)
            p.setStatus(Project.Status.valueOf(req.getStatus()));
        return toResponse(projectRepository.save(p));
    }

    public ProjectResponse update(Long id, ProjectRequest req) {
        Project p = projectRepository.findById(id).orElseThrow();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        if (req.getStatus() != null)
            p.setStatus(Project.Status.valueOf(req.getStatus()));
        return toResponse(projectRepository.save(p));
    }

    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    private ProjectResponse toResponse(Project p) {
        int taskCount = taskRepository.findByProjectId(p.getId()).size();
        return ProjectResponse.builder()
                .id(p.getId()).name(p.getName()).description(p.getDescription())
                .status(p.getStatus().name()).createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt()).ownerId(p.getOwner().getId())
                .ownerName(p.getOwner().getName()).taskCount(taskCount).build();
    }
}
