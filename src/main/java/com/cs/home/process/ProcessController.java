package com.cs.home.process;

import com.cs.home.common.Response;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/process")
@CrossOrigin
public class ProcessController {

    private final ProcessService processService;

    @PostMapping
    Response<ProcessResponse> create(@RequestBody @Valid ProcessCreated processCreated) throws Exception {
        return Response.create(processService.create(processCreated));
    }

    @PutMapping
    Response<ProcessResponse> update(@RequestBody @Valid ProcessUpdated processUpdated) throws Exception {
        return Response.create(processService.update(processUpdated));
    }


    @DeleteMapping("/{processId}")
    Response<String> delete(@PathVariable Integer processId) throws IOException {
        processService.delete(processId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processId}/start")
    Response<String> start(@PathVariable Integer processId) throws Exception {
        processService.start(processId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processId}/stop")
    Response<String> stop(@PathVariable Integer processId) throws Exception {
        processService.stop(processId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processId}/restart")
    Response<String> restart(@PathVariable Integer processId) throws Exception {
        processService.restart(processId);
        return Response.EmptyResponse();
    }

    @GetMapping
    Response<List<ProcessResponse>> getAll() throws Exception {
        return Response.create(processService.getAll());
    }

    @GetMapping("/runningInfos")
    Response<Map<Integer, RunningProcessResponse>> runningProcesses() throws Exception {
        var response = processService.runningProcesses();
        return Response.create(response);
    }

    @GetMapping("/{processId}/logs")
    @ResponseBody
    String getLog(@PathVariable Integer processId) throws Exception {
        return processService.getLog(processId);
    }

    @GetMapping("/distinctProcessPaths")
    @ResponseBody
    Response<List<String>> getDistinctProcessPaths() throws Exception {
        return Response.create(processService.getDistinctProcessPaths());
    }


    @DeleteMapping("/{processId}/logs")
    Response<String> clearProcessLog(@PathVariable Integer processId) throws Exception {
        processService.clearLog(processId);
        return Response.EmptyResponse();
    }


}
