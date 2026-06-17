package ma.ensaf.sportscenter.Dto;

import ma.ensaf.sportscenter.Entity.Notification;

import java.time.LocalDate;
import java.time.LocalTime;

public class NotificationDTO {

    private Long id;
    private String type;
    private String message;
    private LocalDate date;
    private LocalTime time;
    private boolean readStatus;

    public NotificationDTO() {
    }

    public NotificationDTO(String type, String message, LocalDate date, LocalTime time) {
        this.type = type;
        this.message = message;
        this.date = date;
        this.time = time;
        this.readStatus = false;
    }

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.type = notification.getType();
        this.message = notification.getMessage();
        this.date = notification.getNotificationDate();
        this.time = notification.getNotificationTime();
        this.readStatus = notification.isReadStatus();
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getMessage() {
        return message;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getTime() {
        return time;
    }

    public boolean isReadStatus() {
        return readStatus;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public void setReadStatus(boolean readStatus) {
        this.readStatus = readStatus;
    }
}