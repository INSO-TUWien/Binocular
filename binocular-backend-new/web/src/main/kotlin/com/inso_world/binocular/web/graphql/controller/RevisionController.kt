package com.inso_world.binocular.web.graphql.controller

import com.inso_world.binocular.core.service.FileInfrastructurePort
import com.inso_world.binocular.web.graphql.error.GraphQLValidationUtils
import com.inso_world.binocular.web.graphql.mapper.GraphQlMapper
import com.inso_world.binocular.web.graphql.model.PageDto
import com.inso_world.binocular.web.graphql.model.RevisionDto
import com.inso_world.binocular.web.graphql.model.Sort
import com.inso_world.binocular.web.util.PaginationUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.graphql.data.method.annotation.SchemaMapping
import org.springframework.stereotype.Controller

@Controller
@SchemaMapping(typeName = "Revision")
internal class RevisionController(
    @Autowired private val fileService: FileInfrastructurePort,
    @Autowired private val mapper: GraphQlMapper,
) {
    private var logger: Logger = LoggerFactory.getLogger(RevisionController::class.java)

    /**
     * Find all revisions with pagination.
     */
    @QueryMapping(name = "revisions")
    fun findAll(
        @Argument page: Int?,
        @Argument perPage: Int?,
        @Argument sort: Sort?,
    ): PageDto<RevisionDto> {
        logger.info("Getting all revisions...")

        val pageable =
            PaginationUtils.createPageableWithValidation(
                page = page,
                size = perPage,
                sort = sort ?: Sort.DESC,
                sortBy = "id",
            )

        val result = fileService.findAllRevisions(pageable)
        return PageDto(result).map { mapper.toDto(it) }
    }

    /**
     * Find a revision by its ID.
     */
    @QueryMapping(name = "revision")
    fun findById(
        @Argument id: String,
    ): RevisionDto {
        logger.info("Getting revision by id: $id")
        return mapper.toDto(GraphQLValidationUtils.requireEntityExists(fileService.findRevisionById(id), "Revision", id))
    }
}
