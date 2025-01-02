package com.cs.home.process_chain;

import com.cs.home.common.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/processChain")
@RequiredArgsConstructor
@CrossOrigin
public class ProcessChainController {

    private final ProcessChainService processChainService;

    // Create a process group
    @PostMapping
    public Response<ProcessChainResponse> createProcessChain(@RequestBody ProcessChainCreateRequest processChainCreateRequest) {
        ProcessChainResponse response = processChainService.createProcessChain(processChainCreateRequest);
        return Response.create(response);
    }

    // Delete a process group
    @DeleteMapping("/{id}")
    public Response<String> deleteProcessChain(@PathVariable Integer id) {
        processChainService.deleteProcessChain(id);
        return Response.EmptyResponse();
    }

    // Update a process group
    @PutMapping()
    public Response<ProcessChainResponse> updateProcessChain(
            @RequestBody ProcessChainUpdateRequest processChainUpdateRequest) {
        ProcessChainResponse response = processChainService.updateProcessChain(processChainUpdateRequest);
        return Response.create(response);
    }

    @GetMapping
    public Response<List<ProcessChainResponse>> getAllProcessChains() {
        List<ProcessChainResponse> responses = processChainService.getAllProcessChain();
        return Response.create(responses);
    }

    @GetMapping("/{processChainId}")
    public Response<ProcessChainResponse> getProcessChain(@PathVariable Integer processChainId) {
        ProcessChainResponse response = processChainService.getProcessChain(processChainId);
        return Response.create(response);
    }

    @PutMapping("/{processChainId}/start")
    public Response<String> startProcessChain(@PathVariable Integer processChainId) throws Exception {
        processChainService.startProcessChain(processChainId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processChainId}/stop")
    public Response<String> stopProcessChain(@PathVariable Integer processChainId) throws Exception {
        processChainService.stopProcessChain(processChainId);
        return Response.EmptyResponse();
    }

    @PutMapping("/{processChainId}/restart")
    public Response<String> restartProcessChain(@PathVariable Integer processChainId) throws Exception {
        processChainService.restartProcessChain(processChainId);
        return Response.EmptyResponse();
    }
}
