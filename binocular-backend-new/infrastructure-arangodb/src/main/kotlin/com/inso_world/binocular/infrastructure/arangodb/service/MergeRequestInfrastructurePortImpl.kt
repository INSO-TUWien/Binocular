package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.MergeRequestInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestAccountConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestMilestoneConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestNoteConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IMergeRequestDao
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import com.inso_world.binocular.model.Note
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

/**
 * Implementation of the MergeRequestService interface.
 * This service is database-agnostic and works with both ArangoDB and SQL implementations.
 */
@Service
internal class MergeRequestInfrastructurePortImpl :
    AbstractInfrastructurePort<MergeRequest, String>(),
    MergeRequestInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = mergeRequestDao
    }

    @Autowired private lateinit var mergeRequestDao: IMergeRequestDao

    @Autowired private lateinit var mergeRequestAccountConnectionRepository: IMergeRequestAccountConnectionDao

    @Autowired private lateinit var mergeRequestMilestoneConnectionRepository: IMergeRequestMilestoneConnectionDao

    @Autowired private lateinit var mergeRequestNoteConnectionRepository: IMergeRequestNoteConnectionDao
    var logger: Logger = LoggerFactory.getLogger(MergeRequestInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<MergeRequest> {
        logger.trace("Getting all merge requests with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return mergeRequestDao.findAll(pageable)
    }

    override fun findAll(
        pageable: Pageable,
        since: Long?,
        until: Long?,
    ): Page<MergeRequest> {
        logger.trace(
            "Getting merge requests with pageable: page={}, size={}, since={}, until={}",
            pageable.pageNumber,
            pageable.pageSize,
            since,
            until,
        )
        return mergeRequestDao.findAll(pageable, since, until)
    }

    override fun findById(id: String): MergeRequest? {
        logger.trace("Getting merge request by id: $id")
        return mergeRequestDao.findById(id)
    }

    override fun findByIid(iid: MergeRequest.Id): @Valid MergeRequest? {
        logger.trace("Getting merge request by iid: $iid")
        return mergeRequestDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<MergeRequest.Id>): List<@Valid MergeRequest> {
        logger.trace("Getting merge requests by iids: $iids")
        return mergeRequestDao.findAll().filter { it.iid in iids }
    }

    override fun findAccountsByMergeRequestId(mergeRequestId: String): List<Account> {
        logger.trace("Getting accounts for merge request: $mergeRequestId")
        return mergeRequestAccountConnectionRepository.findAccountsByMergeRequest(mergeRequestId)
    }

    override fun findMilestonesByMergeRequestId(mergeRequestId: String): List<Milestone> {
        logger.trace("Getting milestones for merge request: $mergeRequestId")
        return mergeRequestMilestoneConnectionRepository.findMilestonesByMergeRequest(mergeRequestId)
    }

    override fun findNotesByMergeRequestId(mergeRequestId: String): List<Note> {
        logger.trace("Getting notes for merge request: $mergeRequestId")
        return mergeRequestNoteConnectionRepository.findNotesByMergeRequest(mergeRequestId)
    }

    override fun findAll(): Iterable<MergeRequest> = this.mergeRequestDao.findAll()

    override fun create(entity: MergeRequest): MergeRequest = this.mergeRequestDao.save(entity)

    override fun saveAll(entities: Collection<MergeRequest>): Iterable<MergeRequest> = this.mergeRequestDao.saveAll(entities)

    override fun delete(entity: MergeRequest) = this.mergeRequestDao.delete(entity)

    override fun update(entity: MergeRequest): MergeRequest {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.mergeRequestDao.deleteAll()
    }
}
