package com.cs.home.appProcessStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface AppProcessStatusRepository extends JpaRepository<AppProcessStatus,
        Integer>,
        QuerydslPredicateExecutor<AppProcessStatus> {

}
