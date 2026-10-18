package com.inso_world.binocular.infrastructure.sql.persistence.repository

import com.inso_world.binocular.infrastructure.sql.persistence.entity.AccountEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.model.Account
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.stream.Stream

@Repository
internal interface AccountRepository :
    JpaRepository<AccountEntity, Long>,
    JpaSpecificationExecutor<AccountEntity> {
    fun findByIid(iid: Account.Id): AccountEntity?

    fun findAllByIidIn(iids: Collection<Account.Id>): List<AccountEntity>

    fun findAllByIssuesContaining(issue: IssueEntity): Stream<AccountEntity>
// TODO
// fun findAllByMergeRequestsContaining(mergeRequest: MergeRequestEntity): Stream<AccountEntity>

    // TODO uncomment when NoteEntity is implemented
// fun findAllByNotesContaining(note: NoteEntity): Stream<AccountEntity>
}
