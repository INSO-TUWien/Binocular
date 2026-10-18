package com.inso_world.binocular.infrastructure.arangodb.service

import com.inso_world.binocular.core.persistence.model.Page
import com.inso_world.binocular.core.service.FileInfrastructurePort
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IBranchFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.IBranchFileFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.ICommitFileUserConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.edge.IModuleFileConnectionDao
import com.inso_world.binocular.infrastructure.arangodb.persistence.dao.interfaces.node.IFileDao
import com.inso_world.binocular.model.Branch
import com.inso_world.binocular.model.Commit
import com.inso_world.binocular.model.File
import com.inso_world.binocular.model.Module
import com.inso_world.binocular.model.User
import jakarta.annotation.PostConstruct
import jakarta.validation.Valid
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
internal class FileInfrastructurePortImpl :
    AbstractInfrastructurePort<File, String>(),
    FileInfrastructurePort {
    @PostConstruct
    fun init() {
        super.dao = fileDao
    }

    @Autowired private lateinit var fileDao: IFileDao

    @Autowired private lateinit var branchFileConnectionRepository: IBranchFileConnectionDao

    @Autowired private lateinit var branchFileFileConnectionRepository: IBranchFileFileConnectionDao

    @Autowired private lateinit var commitFileConnectionRepository: ICommitFileConnectionDao

    @Autowired private lateinit var moduleFileConnectionRepository: IModuleFileConnectionDao

    @Autowired private lateinit var commitFileUserConnectionRepository: ICommitFileUserConnectionDao
    var logger: Logger = LoggerFactory.getLogger(FileInfrastructurePortImpl::class.java)

    override fun findAll(pageable: Pageable): Page<File> {
        logger.trace("Getting all files with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return fileDao.findAll(pageable)
    }

    override fun findById(id: String): File? {
        logger.trace("Getting file by id: $id")
        return fileDao.findById(id)
    }

    override fun findByIid(iid: File.Id): @Valid File? {
        logger.trace("Getting file by iid: $iid")
        return fileDao.findAll().find { it.iid == iid }
    }

    override fun findByIids(iids: Collection<File.Id>): List<@Valid File> {
        logger.trace("Getting files by iids: $iids")
        return fileDao.findAll().filter { it.iid in iids }
    }

    override fun findBranchesByFileId(fileId: String): List<Branch> {
        logger.trace("Getting branches for file: $fileId")
        return branchFileConnectionRepository.findBranchesByFile(fileId)
    }

    override fun findCommitsByFileId(fileId: String): List<Commit> {
        logger.trace("Getting commits for file: $fileId")
        return commitFileConnectionRepository.findCommitsByFile(fileId)
    }

    override fun findCommitsByFileId(
        fileId: String,
        pageable: Pageable,
    ): Page<Commit> {
        logger.trace("Getting commits for file: $fileId with pageable: page=${pageable.pageNumber}, size=${pageable.pageSize}")
        return commitFileConnectionRepository.findCommitsByFilePaged(fileId, pageable)
    }

    override fun findModulesByFileId(fileId: String): List<Module> {
        logger.trace("Getting modules for file: $fileId")
        return moduleFileConnectionRepository.findModulesByFile(fileId)
    }

    override fun findRelatedFilesByFileId(fileId: String): List<File> {
        logger.trace("Getting related files for file: $fileId")
        return branchFileFileConnectionRepository.findFilesByBranchFile(fileId)
    }

    override fun findUsersByFileId(fileId: String): List<User> {
        logger.trace("Getting users for file: $fileId")
        return commitFileUserConnectionRepository.findUsersByFile(fileId)
    }

    override fun findAllRevisions(pageable: Pageable): Page<com.inso_world.binocular.model.Revision> {
        TODO("Not yet implemented")
    }

    override fun findRevisionById(id: String): com.inso_world.binocular.model.Revision? {
        TODO("Not yet implemented")
    }

    override fun findByPath(path: String): File? {
        logger.trace("Finding file by path: $path")
        return fileDao.findByPath(path)
    }

    override fun findAll(): Iterable<File> = fileDao.findAll()

    override fun create(entity: File): File = this.fileDao.save(entity)

    override fun saveAll(entities: Collection<File>): Iterable<File> = this.fileDao.saveAll(entities)

    override fun delete(entity: File) {
        this.fileDao.delete(entity)
    }

    override fun update(entity: File): File {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: String) {
        TODO("Not yet implemented")
    }

    override fun deleteAll() {
        this.fileDao.deleteAll()
    }
}
