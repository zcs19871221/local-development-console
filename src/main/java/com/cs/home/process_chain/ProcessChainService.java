package com.cs.home.process_chain;

import java.util.List;

public interface ProcessChainService {
    ProcessChainResponse createProcessChain(ProcessChainCreateRequest processChainCreateRequest);

    void deleteProcessChain(Integer id);

    ProcessChainResponse updateProcessChain(ProcessChainUpdateRequest processChainUpdateRequest);

    List<ProcessChainResponse> getAllProcessChain();

    void startProcessChain(Integer processChainId) throws Exception;

    void stopProcessChain(Integer processChainId) throws Exception;
}
