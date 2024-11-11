package com.cs.home.appProcessStatus;

import com.cs.home.common.Response;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/processStatus")
@CrossOrigin
public class AppProcessStatusController {

    private final AppProcessStatusService appProcessStatusService;

    @PostMapping
    Response<AppProcessStatusResponse> create(@RequestBody @Valid AppProcessStatusCreated appProcessStatusCreated) throws Exception {
        return Response.create(appProcessStatusService.create(appProcessStatusCreated));
    }

    @PutMapping
    Response<AppProcessStatusResponse> update(@RequestBody @Valid AppProcessStatusUpdated appProcessStatusUpdated) throws Exception {
        return Response.create(appProcessStatusService.update(appProcessStatusUpdated));
    }


    @DeleteMapping("/{appProcessStatusId}")
    Response<String> delete(@PathVariable Integer appProcessStatusId) throws IOException {
        appProcessStatusService.delete(appProcessStatusId);
        return Response.EmptyResponse();
    }


    @GetMapping
    Response<List<AppProcessStatusResponse>> list() {
        return Response.create(appProcessStatusService.list());
    }


}
