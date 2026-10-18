package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.UserInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IIssueUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.nosql.arangodb.UserDao
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Issue
import com.inso_world.binocular.model.Repository
import com.inso_world.binocular.model.User
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

/**
 * Implementation of the UserService interface.
 * This service is database-agnostic and works with both ArangoDB and SQL implementations.
 */
@Service
internal class UserInfrastructurePortImpl :
    AbstractInfrastructurePort<User, String>(),
    UserInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = userDao
    }

    @Autowired
    private lateinit var userDao: UserDao

    @Autowired
    private lateinit var commitUserConnectionRepository: ICommitUserConnectionDao

    @Autowired
    private lateinit var commitFileUserConnectionRepository: ICommitFileUserConnectionDao

    @Autowired
    private lateinit var issueUserConnectionRepository: IIssueUserConnectionDao
    var logger: Logger = LoggerFactory.getLogger(UserInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<User> {
        logger.trace("Getting all users with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return userDao.findAll(pageable)
    }

    override fun findById(id: String): User? {
        logger.trace("Getting user by id: $id")
        return userDao.findById(id)
    }

    override fun findByIid(iid: User.Id): @Valid User? {
        logger.trace("Getting user by iid: $iid")
        return userDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<User.Id>): List<@Valid User> {
        logger.trace("Getting users by iids: $iids")
        return userDao.findAll().filter { it.iid in iids }
    }

    override fun findCommitsByUserId(userId: String): List<Commit> {
        logger.trace("Getting commits for user: $userId")
        return commitUserConnectionRepository.findCommitsByUser(userId)
    }

    override fun findIssuesByUserId(userId: String): List<Issue> {
        logger.trace("Getting issues for user: $userId")
        return issueUserConnectionRepository.findIssuesByUser(userId)
    }

    override fun findFilesByUserId(userId: String): List<File> {
        logger.trace("Getting files for user: $userId")
        return commitFileUserConnectionRepository.findFilesByUser(userId)
    }

    override fun findAll(repository: Repository): Iterable<User> {
        TODO("Not yet implemented")
    }

    override fun findAll(): Iterable<User> = this.userDao.findAll()

    override fun create(value: User): User {
        val repo = requireNotNull(value.repository)
        val newUser = userDao.create(value)
        repo.user.removeIf { it.email == value.email }
        repo.user.add(newUser)
        return newUser
    }

    override fun saveAll(values: Collection<User>): Iterable<User> = userDao.saveAll(values)

    override fun update(value: User): User {
        TODO("Not yet implemented")
    }
}
