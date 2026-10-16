package com.nexus.platform.common;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    Map<String, String> health() {
        return Map.of("application", "Lumora", "status", "UP", "stage", "architecture-scaffold");
    }
}
