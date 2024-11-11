package com.cs.home.appProcesses;

import com.cs.home.appProcessStatus.AppProcessStatus;
import com.cs.home.appProcessStatus.AppProcessStatusMapper;
import com.cs.home.appProcessStatus.AppProcessStatusRepository;
import com.cs.home.appProcessStatus.AppProcessStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppProcessServiceImpl implements AppProcessService {
    private static final ConcurrentHashMap<Integer, RunningProcess> idMapProcess =
            new ConcurrentHashMap<>();

    private final AppProcessRepository appProcessRepository;

    private final AppProcessStatusRepository appProcessStatusRepository;

    private final AppProcessMapper appProcessMapper;
    private final AppProcessStatusMapper appProcessStatusMapper;

    private final MessageSource messageSource;


    @PostConstruct
    private void addShutDownHook() {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            for (Integer i : idMapProcess.keySet()) {
                try {
                    stop(i);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            System.exit(0);
        }));
    }

    public void start(Integer appProcessId) throws IOException {


        File log = new File(getLogPath(appProcessId));
        AppProcess appProcess = appProcessRepository.getReferenceById(appProcessId);

        RunningProcess rp;
        rp = new RunningProcess(appProcess.getCommand().split(" "),
                appProcess.getPath(), log,
                appProcessStatusMapper.map(appProcess.getAppProcessStatuses())
        );
        rp.setAppProcessId(appProcessId);

        rp.setRunning(true);
        rp.setLabel("");
        rp.setColor("");
        if (idMapProcess.containsKey(appProcessId)) {
            idMapProcess.get(appProcessId).destory();
        }
        idMapProcess.put(appProcessId, rp);
    }


    @Override
    public void stop(Integer appProcessId) throws IOException {
        if (!idMapProcess.containsKey(appProcessId)) {
            return;
        }

        RunningProcess runningProcess = idMapProcess.get(appProcessId);
        Long pid = runningProcess.getProcess().pid();
        runningProcess.getProcess().descendants().forEach(ProcessHandle::destroy);
        runningProcess.getProcess().destroy();
        runningProcess.setRunning(false);
        log.info("command: {}, pid: {}, stopped",
                runningProcess.getPb().command().toString(), pid);
    }

    @Override
    public void restart(Integer appProcessId) throws IOException {
        stop(appProcessId);
        start(appProcessId);
    }

    @Override
    @Transactional
    public AppProcessResponse create(AppProcessCreated appProcessCreated) throws Exception {
        AppProcess appProcess =
                appProcessMapper.map(appProcessCreated);
        for (Integer appProcessStatusId : appProcessCreated.getAppProcessStatusIds()) {
            AppProcessStatus appProcessStatus =
                    appProcessStatusRepository.getReferenceById(appProcessStatusId);
            appProcess.add(appProcessStatus);
        }


        return appProcessMapper.map(appProcessRepository.save(appProcess));
    }

    @Override
    @Transactional
    public AppProcessResponse update(AppProcessUpdated appProcessUpdated) throws Exception {
        Integer id = appProcessUpdated.getId();
        Locale locale = LocaleContextHolder.getLocale();

        if (!appProcessRepository.existsById(id)) {
            throw new IllegalArgumentException(messageSource.getMessage("appProcessIdNotExist"
                    , new Integer[]{id},
                    locale));
        }

        AppProcess appProcess = appProcessMapper.map(appProcessUpdated);

        for (Integer appProcessStatusId : appProcessUpdated.getAppProcessStatusIds()) {
            AppProcessStatus appProcessStatus =
                    appProcessStatusRepository.getReferenceById(appProcessStatusId);
            appProcess.add(appProcessStatus);
        }

        return appProcessMapper.map(appProcessRepository.save(appProcess));
    }


    @Override
    @Transactional
    public void delete(Integer appProcessId) throws IOException {
        if (appProcessRepository.existsById(appProcessId)) {
            appProcessRepository.deleteById(appProcessId);
        }
    }

    @Override
    public void stopAll() throws IOException {
        for (RunningProcess value : idMapProcess.values()) {
            stop(value.getAppProcessId());
        }
    }

    private String getLogPath(Integer appProcessId) {
        return Paths.get(System.getProperty("java.io.tmpdir"),
                appProcessId + ".log").toString();
    }

    @Override
    public void clearLog(Integer appProcessId) throws IOException {
        Files.writeString(Paths.get(getLogPath(appProcessId)), "");
    }

    @Override
    public String logs(Integer appProcessId) throws IOException {
        return Files.readString(Paths.get(getLogPath(appProcessId)));
    }

    public synchronized Map<Integer, RunningProcessResponse> runningProcesses() throws IOException {
        for (Map.Entry<Integer, RunningProcess> numberProcessInfoEntry :
                idMapProcess.entrySet()) {
            Integer appProcessId = numberProcessInfoEntry.getKey();
            RunningProcess runningProcess = numberProcessInfoEntry.getValue();
            Boolean needCleanLog = false;


            String strLine;

            StringBuilder newStr = new StringBuilder();
            while ((strLine = runningProcess.getBr().readLine()) != null) {
                newStr.append(strLine);
                for (AppProcessStatusResponse status :
                        runningProcess.getAppProcessStatuses()) {
                    for (String matcherStr : status.getMatchers()) {
                        Pattern pattern =
                                Pattern.compile("\\b" + matcherStr + "\\b",
                                        Pattern.CASE_INSENSITIVE);
                        Matcher matcher = pattern.matcher(strLine);
                        if (matcher.find()) {
                            runningProcess.setLabel(status.getLabel());
                            runningProcess.setColor(status.getColor());
                            needCleanLog = status.getClear();
                        }
                    }
                }
            }

            if (needCleanLog != null && needCleanLog) {
                Files.writeString(Paths.get(getLogPath(appProcessId)), newStr);
            }

            if (!runningProcess.getProcess().isAlive()) {
                stop(appProcessId);
            }
        }
        return appProcessMapper.map(idMapProcess);
    }

    @Override
    public List<String> paths() {
        List<AppProcess> appProcesses = appProcessRepository.findAll();
        return appProcesses.stream().map(
                AppProcess::getPath).distinct().toList();
    }

    @Override
    public List<AppProcessResponse> list() throws Exception {
        List<AppProcess> appProcesses = appProcessRepository.findAll();
        List<AppProcessResponse> appProcessResponses = new ArrayList<>();
        for (AppProcess appProcess : appProcesses) {
            appProcessResponses.add(appProcessMapper.map(appProcess));
        }
        return appProcessResponses;
    }
}
