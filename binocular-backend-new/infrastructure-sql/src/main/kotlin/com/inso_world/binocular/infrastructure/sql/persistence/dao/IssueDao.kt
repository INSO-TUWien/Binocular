package com.inso_world.binocular.infrastructure.sql.persistence.dao

import com.inso_world.binocular.core.persistence.exception.PersistenceException
import com.inso_world.binocular.infrastructure.sql.persistence.dao.interfaces.IIssueDao
import com.inso_world.binocular.infrastructure.sql.persistence.entity.DeveloperEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
import com.inso_world.binocular.infrastructure.sql.persistence.entity.ProjectEntity
import com.inso_world.binocular.infrastructure.sql.persistence.repository.IssueRepository
import com.inso_world.binocular.infrastructure.sql.persistence.repository.ProjectRepository
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Project
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Repository
import java.util.stream.Stream

@Repository
internal class IssueDao(
    @Autowired
    private val repo: IssueRepository,
    @Autowired
    private val project: ProjectRepository,
) : SqlDao<IssueEntity, Long>(),
    IIssueDao {
    init {
        this.clazz = IssueEntity::class.java
        this.repository = repo
    }

    override fun findByIid(iid: Any): IssueEntity? {
        val uIid: kotlin.uuid.Uuid =
            when (iid) {
                is Issue.Id -> iid.value
                is kotlin.uuid.Uuid -> iid
                is String -> {
                    try {
                        kotlin.uuid.Uuid.parse(iid)
                    } catch (e: IllegalArgumentException) {
                        return null
                    }
                }
                else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
            }
        return this.repo.findByIid(uIid)
    }

    override fun findByIids(iids: Collection<Any>): List<IssueEntity> {
        val uIids =
            iids.mapNotNull { iid ->
                when (iid) {
                    is Issue.Id -> iid.value
                    is kotlin.uuid.Uuid -> iid
                    is String -> {
                        try {
                            kotlin.uuid.Uuid.parse(iid)
                        } catch (e: IllegalArgumentException) {
                            null
                        }
                    }
                    else -> throw IllegalArgumentException("Unsupported iid type: ${iid.javaClass}")
                }
            }
        return this.repo.findAllByIidIn(uIids)
    }

    private object IssueEntitySpecification {
        fun hasProjectId(projectId: Long): Specification<IssueEntity> =
            Specification { root, _, cb ->
                cb.equal(root.get<ProjectEntity>("project").get<Long>("id"), projectId)
            }

        fun hasGidIn(gids: List<String>): Specification<IssueEntity> =
            Specification { root, _, cb ->
                root.get<String>("gid").`in`(gids)
            }
    }

    override fun findAllByUser(user: DeveloperEntity): Stream<IssueEntity> = repo.findAllByDevelopersContaining(user)

    override fun findAllByIidIn(iids: Collection<Issue.Id>): List<IssueEntity> = repo.findAllByIidIn(iids.map { it.value })

    override fun findExistingGid(
        project: com.inso_world.binocular.model.Project,
        ids: List<String>,
    ): Iterable<IssueEntity> {
        val projectId = project.id
        if (projectId == null) throw PersistenceException("Cannot find project without valid ID")
        val ids =
            this.repo.findAll(
                Specification.allOf(
                    IssueEntitySpecification
                        .hasProjectId(projectId.toLong())
                        .and(IssueEntitySpecification.hasGidIn(ids))
                )
            )
        return ids
    }
}

// package com.inso_world.binocular.infrastructure.sql.persistence.dao
//
// import com.inso_world.binocular.core.persistence.dao.interfaces.IIssueDao
// import com.inso_world.binocular.core.persistence.model.Page
// import com.inso_world.binocular.infrastructure.sql.persistence.entity.IssueEntity
// import com.inso_world.binocular.infrastructure.sql.persistence.mapper.IssueMapper
// import com.inso_world.binocular.model.Issue
// import jakarta.persistence.EntityManager
// import jakarta.persistence.PersistenceContext
// import org.springframework.beans.factory.annotation.Autowired
// import org.springframework.context.annotation.Profile
// import org.springframework.data.domain.Pageable
// import org.springframework.stereotype.Repository
// import org.springframework.transaction.annotation.Transactional
//
// /**
// * SQL implementation of IIssueDao.
// */
// @Repository
// @Transactional
// class IssueDao(
//    @Autowired private val issueMapper: IssueMapper,
// ) : IIssueDao {
//    @PersistenceContext
//    private lateinit var entityManager: EntityManager
//
//    override fun findById(id: String): Issue? {
//        val entity = entityManager.find(IssueEntity::class.java, id) ?: return null
//        return issueMapper.toDomain(entity)
//    }
//
//    override fun findAll(): Iterable<Issue> {
//        val query = entityManager.createQuery("FROM IssueEntity", IssueEntity::class.java)
//        val entities = query.resultList
//        return issueMapper.toDomainList(entities)
//    }
//
//    override fun findAll(pageable: Pageable): Page<Issue> {
//        val query = entityManager.createQuery("FROM IssueEntity", IssueEntity::class.java)
//        val countQuery = entityManager.createQuery("SELECT COUNT(i) FROM IssueEntity i", Long::class.java)
//        val totalElements = countQuery.singleResult
//
//        val entities =
//            query
//                .setFirstResult(pageable.pageNumber * pageable.pageSize)
//                .setMaxResults(pageable.pageSize)
//                .resultList
//
//        val content = issueMapper.toDomainList(entities)
//        return Page(content, totalElements, pageable)
//    }
//
//    override fun create(entity: Issue): Issue {
//        val issueEntity = issueMapper.toEntity(entity)
//        entityManager.persist(issueEntity)
//        return issueMapper.toDomain(issueEntity)
//    }
//
//    override fun update(entity: Issue): Issue {
//        val issueEntity = issueMapper.toEntity(entity)
//        val mergedEntity = entityManager.merge(issueEntity)
//        return issueMapper.toDomain(mergedEntity)
//    }
//
//    override fun updateAndFlush(entity: Issue): Issue {
//        val result = update(entity)
//        entityManager.flush()
//        return result
//    }
//
//    override fun delete(entity: Issue) {
//        val issueEntity = issueMapper.toEntity(entity)
//        val managedEntity = entityManager.merge(issueEntity)
//        entityManager.remove(managedEntity)
//    }
//
//    override fun deleteById(id: String) {
//        val entity = entityManager.find(IssueEntity::class.java, id) ?: return
//        entityManager.remove(entity)
//    }
//
//    /**
//     * Delete all entities
//     */
//    override fun deleteAll() {
//        val issues =
//            entityManager
//                .createQuery("SELECT i FROM IssueEntity i", IssueEntity::class.java)
//                .resultList
//        issues.forEach { entityManager.remove(it) }
//    }
//
//    /**
//     * Save an entity (create or update)
//     * For SQL, this is the same as create or update depending on whether the entity exists
//     */
//    override fun save(entity: Issue): Issue {
//        val issueEntity = issueMapper.toEntity(entity)
//        return if (entityManager.find(IssueEntity::class.java, issueEntity.id) != null) {
//            update(entity)
//        } else {
//            create(entity)
//        }
//    }
//
//    /**
//     * Save multiple entities
//     */
//    override fun saveAll(entities: List<Issue>): Iterable<Issue> = entities.map { save(it) }
// }
