package com.inso_world.binocular.cli.service.its

import com.inso_world.binocular.core.service.AccountInfrastructurePort
import com.inso_world.binocular.model.Account
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import java.util.stream.Collectors

@Service
class AccountService(
    private val accountInfrastructurePort: AccountInfrastructurePort
) {
    private val logger = LoggerFactory.getLogger(AccountService::class.java)

    fun saveAll(accounts: List<Account>): Mono<List<Account>> {
        logger.trace("Saving ${accounts.size} accounts")
        return Mono
            .fromCallable {
                accountInfrastructurePort.saveAll(accounts).toList()
            }.subscribeOn(Schedulers.boundedElastic())
    }

    fun checkExisting(minedAccounts: List<Account>): Pair<Collection<Account>, Collection<Account>> {
        val allGids: List<String> =
            minedAccounts
                .stream()
                .map { m -> m.gid }
                .collect(Collectors.toList())

        val existingAccounts: Iterable<Account> = accountInfrastructurePort.findExistingGid(allGids)

        val gidsToRemove = existingAccounts.map { it.gid }
        val missingGids = minedAccounts.filterNot { it.gid in gidsToRemove }

        return Pair(existingAccounts.toList(), missingGids.toList())
    }
}
