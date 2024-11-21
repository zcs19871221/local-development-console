package com.cs.home.log_monitor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface LogMonitorRepository extends JpaRepository<LogMonitor,
        Integer>,
        QuerydslPredicateExecutor<LogMonitor> {

}
