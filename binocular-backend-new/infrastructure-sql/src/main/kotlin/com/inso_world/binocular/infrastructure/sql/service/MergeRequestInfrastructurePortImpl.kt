package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.MergeRequestInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.persistence.dao.MergeRequestDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.MergeRequestLinkDao
import com.inso_world.binocular.infrastructure.sql.persistence.dao.NoteDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.MergeRequestEntity
import com.inso_world.binocular.infrastructure.sql.persistence.mapper.MergeRequestMapper
import com.inso_world.binocular.infrastructure.sql.persistence.mapper.NoteMapper
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import com.inso_world.binocular.model.Project
import jakarta.validation.Valid
import org.springframework.context.annotation.Profile
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.validation.annotation.Validated
import kotlin.uuid.Uuid

@Service
@Profile("postgres")
@Validated
internal class MergeRequestInfrastructurePortImpl(
    private val mrDao: MergeRequestDao,
    private val linkDao: MergeRequestLinkDao,
    private val noteDao: NoteDao,
    private val mrMapper: MergeRequestMapper,
    private val noteMapper: NoteMapper,
) : MergeRequestInfrastructurePort {
    private fun resolveMergeRequestEntity(mergeRequestId: String): MergeRequestEntity? {
        val longId = mergeRequestId.toLongOrNull()
        if (longId != null) {
            return mrDao.findById(longId)
        } else {
            return runCatching { Uuid.parse(mergeRequestId) }.getOrNull()?.let {
                mrDao.findByIid(MergeRequest.Id(it))
            }
        }
    }

    override fun findAccountsByMergeRequestId(mergeRequestId: String): List<Account> {
        val entity = resolveMergeRequestEntity(mergeRequestId) ?: return emptyList()
        return entity.accounts.map { it.toDomain() }
    }

    override fun findMilestonesByMergeRequestId(mergeRequestId: String): List<Milestone> {
        val entity = resolveMergeRequestEntity(mergeRequestId) ?: return emptyList()
        val projectId = entity.project?.iid ?: Project.Id(Uuid.parse("00000000-0000-0000-0000-000000000000"))
        return entity.milestones.map { it.toDomain(projectId) }
    }

    override fun findNotesByMergeRequestId(mergeRequestId: String): List<Note> {
        val entity = resolveMergeRequestEntity(mergeRequestId) ?: return emptyList()
        return entity.notes.map { it.toDomain() }
    }

    override fun findById(id: String): MergeRequest? = mrDao.findById(id.toLongOrNull() ?: -1L)?.let { mrMapper.toDomain(it) }

    override fun findByIid(iid: MergeRequest.Id): @Valid MergeRequest? = mrDao.findByIid(iid)?.let { mrMapper.toDomain(it) }

    override fun findByIids(iids: Collection<MergeRequest.Id>): List<@Valid MergeRequest> =
        mrDao.findByIids(iids).map { mrMapper.toDomain(it) }

    override fun create(value: MergeRequest): MergeRequest = mrMapper.toDomain(mrDao.create(mrMapper.toEntity(value)))

    override fun saveAll(values: Collection<MergeRequest>): Iterable<MergeRequest> =
        mrDao
            .saveAll(
                values.map {
                    mrMapper.toEntity(it)
                }
            ).map { mrMapper.toDomain(it) }

    override fun findAll(): Iterable<MergeRequest> = mrDao.findAll().map { mrMapper.toDomain(it) }

    override fun findAll(pageable: Pageable): Page<MergeRequest> {
        val total = mrDao.count()
        if (total == 0L) return Page(emptyList(), 0, pageable)
        val entities = mrDao.findAll(pageable)
        return Page(entities.content.map { mrMapper.toDomain(it) }, total, pageable)
    }

    /**
     * Date-filtered pagination is intentionally unsupported on the SQL side.
     * [since]/[until] are ignored and the unfiltered page is returned, matching
     * [com.inso_world.binocular.infrastructure.sql.service.IssueInfrastructurePortImpl.findAll]
     * (date filtering exists only in ArangoDB DAOs).
     */
    override fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?
    ): Page<MergeRequest> = findAll(pageable)

    override fun update(value: MergeRequest): MergeRequest = mrMapper.toDomain(mrDao.update(mrMapper.toEntity(value)))

    override fun delete(value: MergeRequest) {
        value.id?.let { deleteById(it) }
    }

    override fun deleteById(id: String) {
        linkDao.deleteLinksByMergeRequestId(id)
        id.toLongOrNull()?.let { mrDao.deleteById(it) }
    }

    override fun deleteAll() {
        linkDao.deleteAllLinks()
        mrDao.deleteAll()
    }
}
