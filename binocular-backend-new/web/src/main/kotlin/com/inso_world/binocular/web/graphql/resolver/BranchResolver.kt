package com.inso_world.binocular.web.graphql.resolver

import com.inso_world.binocular.core.service.BranchInfrastructurePort
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
class BranchResolver(
    private val branchService: BranchInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private val logger: Logger = LoggerFactory.getLogger(BranchResolver::class.java)

    /**
     * Resolves the files field for a Branch in GraphQL.
     *
     * This method retrieves all files associated with the given branch.
     * If the branch ID is null, an empty list is returned inside the PaginatedFileInBranchDto.
     *
     * @param branch The branch for which to retrieve files
     * @return A PaginatedFileInBranchDto containing files associated with the branch
     */
    @SchemaMapping(typeName = "Branch", field = "files")
    fun files(
        branch: BranchDto,
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?
    ): PaginatedFileInBranchDto {
        val currentPage = (page ?: 1).coerceAtLeast(1)
        val pageSize = perPage ?: 1000
        val id =
            branch.id ?: return PaginatedFileInBranchDto(
                count = 0,
                page = currentPage,
                perPage = pageSize,
                data = emptyList(),
            )
        logger.info("Resolving files for branch: $id (page=$page, perPage=$perPage, sort=$sort)")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = currentPage,
                size = pageSize,
                sort = sort ?: Sort.ASC,
                sortBy = "path",
            )
        val pageResult = branchService.findFilesByBranchId(id, pageable)
        return PaginatedFileInBranchDto(
            count = pageResult.totalElements.toInt(),
            page = currentPage,
            perPage = pageSize,
            data = pageResult.content.map { f -> FileInBranchDto(file = mapper.toDto(f)) }
        )
    }
}
