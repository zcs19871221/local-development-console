package com.cs.home.system;


import com.cs.home.HomeApplication;
import com.cs.home.common.Response;
import com.cs.home.process.ProcessService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.util.Locale;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api/system")
@CrossOrigin
@Slf4j
public class SystemController {

    private final ProcessService processService;

    private MessageSource messageSource;


    @GetMapping("/read")
    @ResponseBody
    String read(String path) throws Exception {
        return Files.readString(Paths.get(URLDecoder.decode(path)));
    }

    @PutMapping("/shutdown")
    Response<String> shutdown(Locale locale) throws Exception {
        HomeApplication.running = false;
        Runnable runnable = () -> {
            try {
                processService.destroyAll();
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                log.error("Thread was Interrupted! Error in Thread Sleep (5 " +
                        "Seconds!)", e);
            } catch (Exception e) {
                log.error("error on destroy process", e);
            }
            HomeApplication.applicationContext.close();
            log.info("system shutdown at {}",
                    ZonedDateTime.now());
            System.exit(0);
        };
        new Thread(runnable).start();
        return Response.create(messageSource.getMessage(
                "shutdownAfter5seconds", new String[]{}, locale));
    }

    @GetMapping("/run")
    Response<String> run(String command) throws IOException {
        command = URLDecoder.decode(command, StandardCharsets.UTF_8);
        String[] commands = command.split(" ");
        ProcessBuilder pb = new ProcessBuilder(commands);
        pb.start();
        return Response.EmptyResponse();
    }

}
