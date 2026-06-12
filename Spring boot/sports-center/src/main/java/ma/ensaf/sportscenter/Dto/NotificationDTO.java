package ma.ensaf.sportscenter.Dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class NotificationDTO {

    private String type;
    private String message;
    private LocalDate date;
    private LocalTime time;

    public NotificationDTO() {
    }

    public NotificationDTO(String type, String message, LocalDate date, LocalTime time) {
        this.type = type;
        this.message = message;
        this.date = date;
        this.time = time;
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
}