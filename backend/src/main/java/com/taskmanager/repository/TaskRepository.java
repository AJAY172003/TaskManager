package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByProjectIdAndStatus(Long projectId, Task.Status status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.updatedAt >= :since")
    List<Task> findRecentlyUpdated(@Param("projectId") Long projectId,
                                   @Param("since") LocalDateTime since);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate < CURRENT_DATE AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("projectId") Long projectId);
}
