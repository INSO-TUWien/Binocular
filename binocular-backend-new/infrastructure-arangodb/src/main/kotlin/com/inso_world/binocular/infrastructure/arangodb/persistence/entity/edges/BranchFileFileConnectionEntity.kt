package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a BranchFile and a File.
 */
@Edge(value = "branch-files-files")
data class BranchFileFileConnectionEntity(
    @Id var id: String? = null,
    @From var from: FileEntity,
    @To var to: FileEntity,
)
