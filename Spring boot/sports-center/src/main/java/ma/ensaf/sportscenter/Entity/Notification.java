package ma.ensaf.sportscenter.Entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String targetRole;

    private Long targetId;

    private String type;

    @Column(length = 1000)
    private String message;

    private LocalDate notificationDate;

    private LocalTime notificationTime;

    private boolean readStatus = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {
    }

    public Notification(
            String targetRole,
            Long targetId,
            String type,
            String message,
            LocalDate notificationDate,
            LocalTime notificationTime
    ) {
        this.targetRole = targetRole;
        this.targetId = targetId;
        this.type = type;
        this.message = message;
        this.notificationDate = notificationDate;
        this.notificationTime = notificationTime;
        this.readStatus = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDate getNotificationDate() {
        return notificationDate;
    }

    public void setNotificationDate(LocalDate notificationDate) {
        this.notificationDate = notificationDate;
    }

    public LocalTime getNotificationTime() {
        return notificationTime;
    }

    public void setNotificationTime(LocalTime notificationTime) {
        this.notificationTime = notificationTime;
    }

    public boolean isReadStatus() {
        return readStatus;
    }

    public void setReadStatus(boolean readStatus) {
        this.readStatus = readStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}