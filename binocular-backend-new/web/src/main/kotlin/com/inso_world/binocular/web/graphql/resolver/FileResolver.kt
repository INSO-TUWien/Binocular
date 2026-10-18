package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.FileInfrastructurePort
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.*
import com.inso_world.binocular.web.util.PaginationUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
class FileResolver(
    private val fileService: FileInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(FileResolver::class.java)

    /**
     * Resolves the branches field for a File in GraphQL.
     *
     * This method retrieves all branches associated with the given file.
     * If the file ID is null, an empty list is returned.
     *
     * @param file The file for which to retrieve branches
     * @return A list of branches associated with the file, or an empty list if the file ID is null
     */
    @SchemaMapping(typeName = "File", field = "branches")
    fun branches(file: FileDto): List<BranchDto> {
        val id = file.id ?: return emptyList()
        logger.info("Resolving branches for file: $id")
        // Get all connections for this file and extract the branches
        return fileService.findBranchesByFileId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the commits field for a File in GraphQL.
     *
     * This method retrieves all commits associated with the given file.
     * If the file ID is null, an empty list is returned.
     *
     * @param file The file for which to retrieve commits
     * @return A list of commits associated with the file, or an empty list if the file ID is null
     */
    @SchemaMapping(typeName = "File", field = "commits")
    fun commits(
        file: FileDto,
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?
    ): PaginatedCommitInFileDto {
        val currentPage = (page ?: 1).coerceAtLeast(1)
        val pageSize = perPage ?: 1000
        val id =
            file.id ?: return PaginatedCommitInFileDto(
                count = 0,
                page = currentPage,
                perPage = pageSize,
                data = emptyList()
            )
        logger.info("Resolving commits for file: $id (page=$page, perPage=$perPage, sort=$sort)")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = currentPage,
                size = pageSize,
                sort = sort ?: Sort.ASC,
                sortBy = "commitDateTime",
            )
        val commitsPage = fileService.findCommitsByFileId(id, pageable)

        val data = commitsPage.content.map { c -> CommitInFile(commit = mapper.toDto(c)) }
        return PaginatedCommitInFileDto(
            count = commitsPage.totalElements.toInt(),
            page = currentPage,
            perPage = pageSize,
            data = data,
        )
    }

    /**
     * Resolves the modules field for a File in GraphQL.
     *
     * This method retrieves all modules associated with the given file.
     * If the file ID is null, an empty list is returned.
     *
     * @param file The file for which to retrieve modules
     * @return A list of modules associated with the file, or an empty list if the file ID is null
     */
    @SchemaMapping(typeName = "File", field = "modules")
    fun modules(file: FileDto): List<ModuleDto> {
        val id = file.id ?: return emptyList()
        logger.info("Resolving modules for file: $id")
        // Get all connections for this file and extract the modules
        return fileService.findModulesByFileId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the relatedFiles field for a File in GraphQL.
     *
     * This method retrieves all related files associated with the given file.
     * If the file ID is null, an empty list is returned.
     *
     * @param file The file for which to retrieve related files
     * @return A list of related files associated with the file, or an empty list if the file ID is null
     */
    @SchemaMapping(typeName = "File", field = "relatedFiles")
    fun relatedFiles(file: FileDto): List<FileDto> {
        val id = file.id ?: return emptyList()
        logger.info("Resolving related files for file: $id")
        // Get all connections for this file and extract the related files
        return fileService.findRelatedFilesByFileId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the users field for a File in GraphQL.
     *
     * This method retrieves all users associated with the given file.
     * If the file ID is null, an empty list is returned.
     *
     * @param file The file for which to retrieve users
     * @return A list of users associated with the file, or an empty list if the file ID is null
     */
    @SchemaMapping(typeName = "File", field = "users")
    fun users(file: FileDto): List<UserDto> {
        val id = file.id ?: return emptyList()
        logger.info("Resolving users for file: $id")
        // Get all connections for this file and extract the users
        return fileService.findUsersByFileId(id).map { mapper.toDto(it) }
    }

    /**
     * Resolves the revisions field for a File in GraphQL.
     *
     * @param file The file for which to retrieve revisions
     * @return A list of revisions associated with the file, or an empty list if the file ID is null
     */
    @SchemaMapping(typeName = "File", field = "revisions")
    fun revisions(file: FileDto): List<RevisionDto> {
        val id = file.id ?: return emptyList()
        logger.info("Resolving revisions for file: $id")
        return emptyList()
    }
}
