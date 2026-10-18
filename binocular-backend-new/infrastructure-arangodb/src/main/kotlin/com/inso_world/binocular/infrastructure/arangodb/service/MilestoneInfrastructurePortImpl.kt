package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.MilestoneInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueMilestoneConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IMergeRequestMilestoneConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IMilestoneDao
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.MergeRequest
import com.inso_world.binocular.model.Milestone
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

/**
 * Implementation of the MilestoneService interface.
 * This service is database-agnostic and works with both ArangoDB and SQL implementations.
 */
@Service
internal class MilestoneInfrastructurePortImpl :
    AbstractInfrastructurePort<Milestone, String>(),
    MilestoneInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = milestoneDao
    }

    @Autowired private lateinit var milestoneDao: IMilestoneDao

    @Autowired private lateinit var issueMilestoneConnectionRepository: IIssueMilestoneConnectionDao

    @Autowired private lateinit var mergeRequestMilestoneConnectionRepository: IMergeRequestMilestoneConnectionDao
    var logger: Logger = LoggerFactory.getLogger(MilestoneInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<Milestone> {
        logger.trace("Getting all milestones with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return milestoneDao.findAll(pageable)
    }

    override fun findById(id: String): Milestone? {
        logger.trace("Getting milestone by id: $id")
        return milestoneDao.findById(id)
    }

    override fun findByIid(iid: Milestone.Id): @Valid Milestone? {
        logger.trace("Getting milestone by iid: $iid")
        return milestoneDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<Milestone.Id>): List<@Valid Milestone> {
        logger.trace("Getting milestones by iids: $iids")
        return milestoneDao.findAll().filter { it.iid in iids }
    }

    override fun findIssuesByMilestoneId(milestoneId: String): List<Issue> {
        logger.trace("Getting issues for milestone: $milestoneId")
        return issueMilestoneConnectionRepository.findIssuesByMilestone(milestoneId)
    }

    override fun findMergeRequestsByMilestoneId(milestoneId: String): List<MergeRequest> {
        logger.trace("Getting merge requests for milestone: $milestoneId")
        return mergeRequestMilestoneConnectionRepository.findMergeRequestsByMilestone(milestoneId)
    }

    override fun findAll(): Iterable<Milestone> = this.milestoneDao.findAll()

    override fun create(entity: Milestone): Milestone = this.milestoneDao.save(entity)

    override fun saveAll(entities: Collection<Milestone>): Iterable<Milestone> = this.milestoneDao.saveAll(entities)

    override fun delete(entity: Milestone) = this.milestoneDao.delete(entity)

    override fun update(entity: Milestone): Milestone {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.milestoneDao.deleteAll()
    }
}
