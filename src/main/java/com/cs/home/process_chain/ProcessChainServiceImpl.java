package com.cs.home.process_chain;

import com.cs.home.process.ProcessRepository;
import com.cs.home.process.ProcessService;
import com.cs.home.process.ProcessServiceImpl;
import com.cs.home.process.RunningProcess;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProcessChainServiceImpl implements ProcessChainService {

    private final ProcessChainRepository processChainRepository;

    private final ProcessChainMapper processChainMapper;

    private final ProcessService processService;

    private final ProcessRepository processRepository;

    @Override
    @Transactional
    public ProcessChainResponse createProcessChain(ProcessChainCreateRequest processChainCreateRequest) {
        ProcessChain processChain = processChainRepository.save(processChainMapper.map(processChainCreateRequest));
        return processChainMapper.map(processChain);
    }

    @Override
    public void deleteProcessChain(Integer id) {
        validProcessChainId(id);
        processChainRepository.deleteById(id);
    }

    @Override
    public ProcessChainResponse updateProcessChain(ProcessChainUpdateRequest processChainUpdateRequest) {
        validProcessChainId(processChainUpdateRequest.getId());
        ProcessChain processChain = processChainRepository.save(processChainMapper.map(processChainUpdateRequest));
        return processChainMapper.map(processChain);
    }

    @Override
    public List<ProcessChainResponse> getAllProcessChain() {
        List<ProcessChain> processChains = processChainRepository.findAll();
        return processChainMapper.map(processChains);
    }

    @Override
    public void startProcessChain(Integer processChainId) throws Exception {
        validProcessChainId(processChainId);
        ProcessChain processChain = processChainRepository.getReferenceById(processChainId);
        List<ProcessChainConfig> processChainConfigs = processChain.getProcessChainConfigs();
        int matchedProcessCount = processChainRepository.findAllById(processChainConfigs.stream().map(ProcessChainConfig::getProcessId).toList()).size();
        if (matchedProcessCount != processChainConfigs.size()) {
            throw new RuntimeException("processChain configs has invalid process");
        }
        doStartProcessChain(processChainConfigs, null);
    }

    private void doStartProcessChain(List<ProcessChainConfig> processChainConfigs, Integer prevProcessId) throws InterruptedException {
        if (processChainConfigs == null) {
            return;
        }
        RunningProcess prev = ProcessServiceImpl.idMapProcess.get(prevProcessId);
        for (ProcessChainConfig chainConfig : processChainConfigs) {
             new Thread(() -> {
                 try {
                     if (chainConfig.isWaitForPreviousCompletion() && prev != null) {
                         long startTime = System.currentTimeMillis(); // Get the current time in milliseconds
                         while (prev.getSystemProcess().isAlive() && System.currentTimeMillis() - startTime < 60 * 1000) {

                         }
                     }
                     if (!chainConfig.isWaitForPreviousCompletion() && prev != null) {
                        Thread.sleep(chainConfig.getDelayInMilliseconds());
                     }
                     processService.start(chainConfig.getProcessId());
                     doStartProcessChain(chainConfig.getChildProcessChainConfigs(), chainConfig.getProcessId());
                 } catch (Exception e) {
                     throw new RuntimeException(e);
                 }
             });

        }
    }

    @Override
    public void stopProcessChain(Integer processChainId) throws Exception {
        validProcessChainId(processChainId);
        ProcessChain processChain = processChainRepository.getReferenceById(processChainId);
        List<ProcessChainConfig> processChainConfigs = processChain.getProcessChainConfigs();
        doStopProcessChain(processChainConfigs);
    }

    private void doStopProcessChain(List<ProcessChainConfig> processChainConfigs) throws Exception {
        if (processChainConfigs == null) {
            return;
        }
        for (ProcessChainConfig processChainConfig : processChainConfigs) {
            processService.stop(processChainConfig.getProcessId());
            doStopProcessChain(processChainConfig.getChildProcessChainConfigs());
        }
    }


    private void validProcessChainId(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("processChain Id is null");
        }

        if (!processChainRepository.existsById(id)) {
            throw new IllegalArgumentException("processChain Id" + id + "does not exists");
        }
    }

}
