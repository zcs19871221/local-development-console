package com.cs.home.process;

import com.cs.home.HomeApplication;
import com.cs.home.log_monitor.LogMonitor;
import com.cs.home.log_monitor.LogMonitorMapper;
import com.cs.home.log_monitor.LogMonitorRepository;
import com.cs.home.log_monitor.LogMonitorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.persistence.EntityNotFoundException;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessServiceImpl implements ProcessService {
    public static final ConcurrentHashMap<Integer, RunningProcess> idMapProcess =
            new ConcurrentHashMap<>();

    private final ProcessRepository processRepository;

    private final LogMonitorRepository logMonitorRepository;

    private final LogMonitorService logMonitorService;

    private final ProcessMapper processMapper;

    private final LogMonitorMapper logMonitorMapper;

    private final MessageSource messageSource;

    public RunningProcess start(Integer processId) throws Exception {
        validProcessExists(processId);
        RunningProcess existsRunningProcess = idMapProcess.getOrDefault(processId, null);
        if (existsRunningProcess != null && idMapProcess.get(processId).getRunning().get()) {
            return null;
        }
        if (existsRunningProcess != null) {
            existsRunningProcess.start();
            return existsRunningProcess;
        }
        Optional<Process> process = processRepository.findById(processId);

        LogMonitor logMonitor = process.get().getLogMonitor();
        RunningProcess rp = new RunningProcess(process.get().getCommand().split(" "),
                process.get().getPath(), (logMonitor != null && logMonitor.getStatusConfigurations() != null) ?
                logMonitorMapper.map(process.get().getLogMonitor().getStatusConfigurations()) : new ArrayList<>(),
                processId
        );
        rp.start();
        idMapProcess.put(processId, rp);
        return rp;
    }

    @Override
    public void stop(Integer processId) throws Exception {
        if (!idMapProcess.containsKey(processId)) {
            return;
        }

        RunningProcess runningProcess = idMapProcess.get(processId);
        runningProcess.stop();
        idMapProcess.remove(processId);
    }

    @Override
    public void restart(Integer processId) throws Exception {
        stop(processId);
        start(processId);
    }

    @Override
    @Transactional
    public ProcessResponse create(ProcessCreated processCreated) throws Exception {
        Process process =
                processMapper.map(processCreated);
        ensureSetLogMonitor(process, processCreated.getLogMonitorId());
        return processMapper.map(processRepository.save(process));
    }

    @PostConstruct
    private void startDaemon() {
        RunningProcess.startDaemon();
    }

    @Override
    @Transactional
    public ProcessResponse update(ProcessUpdated processUpdated) throws Exception {
        validProcessExists(processUpdated.getId());
        Process process = processMapper.map(processUpdated);
        ensureSetLogMonitor(process, processUpdated.getLogMonitorId());
        return processMapper.map(processRepository.save(process));
    }


    @Override
    @Transactional
    public void delete(Integer processId) throws IOException {
        validProcessExists(processId);
        processRepository.deleteById(processId);
    }

    @Override
    @PreDestroy
    public void destroyAll() throws Exception {
        RunningProcess.stopDaemonQueue();
        for (RunningProcess runningProcess : idMapProcess.values()) {
            runningProcess.destory();
        }
    }

    private String getLogPath(Integer processId) {
        return Paths.get(System.getProperty("java.io.tmpdir"),
                processId + ".processOutputLog").toString();
    }

    @Override
    public void clearLog(Integer processId) throws Exception {
        RunningProcess runningProcess = idMapProcess.getOrDefault(processId, null);
        if (runningProcess != null) {
            runningProcess.clearLog();
        }
    }

    @Override
    public String getLog(Integer processId) throws Exception {
        RunningProcess runningProcess = idMapProcess.getOrDefault(processId, null);
        if (runningProcess == null) {
            return "";
        }
        return runningProcess.readLog();
    }

    public synchronized Map<Integer, RunningProcessResponse> runningProcesses() throws Exception {
        Map<Integer, RunningProcessResponse> runningProcessResponseMap = new HashMap<>();
        if (!HomeApplication.running) {
            return runningProcessResponseMap;
        }
        for (RunningProcess runningProcess :
                idMapProcess.values()) {

            runningProcess.setStatusAndHighlightLog();
            runningProcessResponseMap.put(runningProcess.getProcessId(), processMapper.map(runningProcess));
        }
        return runningProcessResponseMap;
    }


    @Override
    public List<String> getDistinctProcessPaths() {
        List<Process> processes = processRepository.findAll();
        return processes.stream().map(
                Process::getPath).distinct().toList();
    }

    @Override
    public List<ProcessResponse> getAll() throws Exception {
        List<Process> processes = processRepository.findAll();
        List<ProcessResponse> processResponses = new ArrayList<>();
        for (Process process : processes) {
            processResponses.add(processMapper.map(process));
        }
        return processResponses;
    }


    private void ensureSetLogMonitor(Process process, Integer logMonitorId) {
        if (logMonitorId != null) {
            logMonitorService.validLogMonitorExists(logMonitorId);
            process.setLogMonitor(logMonitorRepository.getReferenceById(logMonitorId));
        }
    }

    private void validProcessExists(Integer processId) {
        if (!processRepository.existsById(processId)) {
            Locale locale = LocaleContextHolder.getLocale();

            throw new EntityNotFoundException(messageSource.getMessage("processNotFound"
                    , new Integer[]{processId},
                    locale));
        }
    }

}
