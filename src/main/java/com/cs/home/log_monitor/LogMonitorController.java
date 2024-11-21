package com.cs.home.log_monitor;

import com.cs.home.common.Response;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/logMonitor")
@CrossOrigin
public class LogMonitorController {

    private final LogMonitorService logMonitorService;

    @PostMapping
    Response<LogMonitorResponse> create(@RequestBody @Valid LogMonitorCreated logMonitorCreated) {
        return Response.create(logMonitorService.create(logMonitorCreated));
    }

    @PutMapping
    Response<LogMonitorResponse> update(@RequestBody @Valid LogMonitorUpdated logMonitorUpdated) {
        return Response.create(logMonitorService.update(logMonitorUpdated));
    }


    @DeleteMapping("/{logMonitorId}")
    Response<String> delete(@PathVariable Integer logMonitorId) throws IOException {
        logMonitorService.delete(logMonitorId);
        return Response.EmptyResponse();
    }


    @GetMapping
    Response<List<LogMonitorResponse>> getAll() {
        return Response.create(logMonitorService.getAll());
    }

    @GetMapping("/{logMonitorId}")
    Response<LogMonitorResponse> getById(@PathVariable Integer logMonitorId) {
        return Response.create(logMonitorService.getById(logMonitorId));
    }


}
