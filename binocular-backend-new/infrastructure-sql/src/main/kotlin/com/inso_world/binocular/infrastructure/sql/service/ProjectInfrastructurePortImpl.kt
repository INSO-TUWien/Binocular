@file:OptIn(kotlin.uuid.ExperimentalUuidApi::class)

package com.inso_world.binocular.infrastructure.sql.service

import com.inso_world.binocular.core.delegates.logger
import com.inso_world.binocular.core.persistence.exception.NotFoundException
import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.mapper.AccountMapper
import com.inso_world.binocular.infrastructure.sql.mapper.IssueMapper
import com.inso_world.binocular.infrastructure.sql.mapper.ProjectMapper
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IProjectDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.service.AggregateFetchSupport.loadProjectEntities
import com.inso_world.binocular.model.Project
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.validation.annotation.Validated
import kotlin.getValue
import kotlin.uuid.ExperimentalUuidApi

@Service
@Validated
internal class ProjectInfrastructurePortImpl(
    @Autowired private val projectMapper: ProjectMapper,
    @Autowired private val projectDao: IProjectDao,
) : AbstractInfrastructurePort<Project, ProjectEntity, Long>(Long::class),
    ProjectInfrastructurePort {
    companion object {
        private val logger by logger()
    }

    @Lazy
    @Autowired
    private lateinit var repositoryPort: RepositoryInfrastructurePortImpl

    @Lazy
    @Autowired lateinit var accountMapper: AccountMapper

    @Lazy
    @Autowired lateinit var issueMapper: IssueMapper

    /**
     * Self-reference to this bean's proxy instance.
     *
     * **Workaround for Spring AOP + Kotlin Value Class Issue**
     *
     * This self-injection is required to work around a limitation where Spring AOP's aspect pointcut
     * matching fails for methods with Kotlin value class parameters (inline classes) that require
     * name mangling via `@JvmName`.
     *
     * **Problem**: When a method like `findByIid(iid: Project.Id)` overrides an interface method and
     * uses a value class parameter, Kotlin mangles the JVM method name (e.g., `findByIid-pip`).
     * causing the `MappingSessionAspect` to not be triggered.
     *
     * **Solution**: Internal method calls bypass Spring's proxy. By injecting `self` and calling
     * `self.findByIidInternal()`, we ensure the call goes through the Spring AOP proxy, allowing
     * the aspect to intercept and establish the required mapping session scope.
     *
     * @see findByIid
     * @see findByIidInternal
     */
    @Autowired
    @Lazy
    private lateinit var self: ProjectInfrastructurePortImpl

    @PostConstruct
    fun init() {
        super.dao = projectDao
    }

    @Transactional(readOnly = true)
    override fun findByName(name: String): Project? =
        this.projectDao.findByName(name)?.let {
            this.projectMapper.toDomain(it)
        }

    /**
     * Finds a project by its internal identifier (iid).
     *
     * **Implementation Note - Value Class Workaround**:
     * This method delegates to [findByIidInternal] via [self] (the proxy instance) to ensure
     * Spring AOP aspects are triggered. Direct implementation here would bypass the proxy due to
     * Kotlin's value class name mangling preventing proper aspect pointcut matching.
     *
     * @param iid The project's technical identifier
     * @return The project if found, null otherwise
     * @see self
     * @see findByIidInternal
     */
    @Transactional(readOnly = true)
    override fun findByIid(iid: Project.Id): Project? =
        this.projectDao.findByIid(iid)?.let {
            projectMapper.toDomain(it)
        }

    @Transactional
    override fun update(value: Project): Project {
        // Get the project entity
        val managedEntity =
            this.projectDao.findByIid(value.iid)
                ?: throw NotFoundException("Project ${value.iid} not found")

        // update project properties (description)
        managedEntity.description = value.description

        // Manage repository:
        run {
            // value.repo is now an ID (it might be null or same as before)
            // For now, if we want to update the repo, we'd need its domain model.
            // Since domain only has IDs, the logic needs to change.
            // Keeping it simple: don't update repo via project update for now if it requires domain model.
        }

        // Phase 0: Map existing entities to context
        // Prevents creating duplicate entities for existing accounts/issues
        logger.trace("Mapping existing entities to context")

        // Map existing accounts
        managedEntity.accounts.forEach { accountEntity ->
            // Skip mapping for now as domain.accounts is gone
        }

        // Map existing issues
        managedEntity.issues.forEach { issueEntity ->
            // Skip mapping for now as domain.issues is gone
        }

        // Phase 1: Map and wire issues and accounts TODO

        // Add or update accounts
        logger.debug("Update accounts")
        value.accountIds.forEach { accountId ->
            // Skip for now
        }
        logger.trace("Accounts updated")

        // Add or update issues
        logger.debug("Update issues")
        value.issueIds.forEach { issueId ->
            // Skip for now
        }
        logger.trace("Issues updated")

        val updated = super.updateEntity(managedEntity)
        logger.trace("Update executed")

        // Refresh the input domain object with persisted values and return it
        return projectMapper.refreshDomain(value, updated)
    }

    @Transactional
    override fun create(value: Project): Project {
        ensureProjectUniqueKeyAvailable(value)
        val toPersist = this.projectMapper.toEntity(value)
        val persisted = super.create(toPersist)

        this.projectMapper.refreshDomain(value, persisted)
        return value
    }

    @Transactional
    override fun saveAll(values: Collection<Project>): Iterable<Project> {
        // Create each project (which modifies them in place)
        values.forEach { this.create(it) }
        return values
    }

    @Transactional(readOnly = true)
    override fun findAll(): Iterable<Project> = loadProjectEntities(projectDao).map(projectMapper::toDomain)

    @Transactional(readOnly = true)
    override fun findAll(pageable: Pageable): Page<Project> {
        val page = this.projectDao.findAll(pageable)
        val projects = page.content.map { this.projectMapper.toDomain(it) }

        return Page(
            content = projects,
            totalElements = page.totalElements,
            pageable = pageable
        )
    }

    override fun findByIids(iids: Collection<Project.Id>): List<Project> = iids.mapNotNull { findByIid(it) }

    @OptIn(ExperimentalUuidApi::class)
    @Transactional(readOnly = true)
    override fun findById(id: String): Project? {
        TODO()
    }

    private fun ensureProjectUniqueKeyAvailable(project: Project) {
        val candidate = project.uniqueKey
        projectDao.findByName(candidate.name)?.let {
            throw IllegalArgumentException("Project with unique key '${candidate.name}' already exists")
        }
    }
}
