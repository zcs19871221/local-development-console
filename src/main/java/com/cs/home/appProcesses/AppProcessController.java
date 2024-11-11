package com.cs.home.appProcesses;

import com.cs.home.common.Response;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/processes")
@CrossOrigin
public class AppProcessController {

    private final AppProcessService appProcessService;

    @PostMapping
    Response<AppProcessResponse> create(@RequestBody @Valid AppProcessCreated processCreated) throws Exception {
        return Response.create(appProcessService.create(processCreated));
    }

    @PutMapping
    Response<AppProcessResponse> update(@RequestBody @Valid AppProcessUpdated processUpdated) throws Exception {
        return Response.create(appProcessService.update(processUpdated));
    }


    @DeleteMapping("/{processId}")
    Response<String> delete(@PathVariable Integer processId) throws IOException {
        appProcessService.delete(processId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processId}/start")
    Response<String> startServer(@PathVariable Integer processId) throws Exception {
        appProcessService.start(processId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processId}/stop")
    Response<String> stopServer(@PathVariable Integer processId) throws Exception {
        appProcessService.stop(processId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processId}/restart")
    Response<String> restartServer(@PathVariable Integer processId) throws Exception {
        appProcessService.restart(processId);
        return Response.EmptyResponse();
    }

    @GetMapping
    Response<List<AppProcessResponse>> list() throws Exception {
        return Response.create(appProcessService.list());
    }

    @GetMapping("/runningInfos")
    Response<Map<Integer, RunningProcessResponse>> runningProcesses() throws Exception {
        return Response.create(appProcessService.runningProcesses());
    }

    @GetMapping("/{processId}/logs")
    @ResponseBody
    String logs(@PathVariable Integer processId) throws Exception {
        return appProcessService.logs(processId);
    }

    @GetMapping("/paths")
    @ResponseBody
    Response<List<String>> paths() throws Exception {
        return Response.create(appProcessService.paths());
    }


    @DeleteMapping("/{processId}/logs")
    Response<String> clearLog(@PathVariable Integer processId) throws Exception {
        appProcessService.clearLog(processId);
        return Response.EmptyResponse();
    }


}
