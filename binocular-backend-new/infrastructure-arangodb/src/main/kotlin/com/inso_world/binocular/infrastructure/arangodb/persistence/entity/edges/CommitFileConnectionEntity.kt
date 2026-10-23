package com.inso_world.binocular.infrastructure.arangodb.persistence.entity.edges

import com.arangodb.springframework.annotation.Edge
import com.arangodb.springframework.annotation.From
import com.arangodb.springframework.annotation.To
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.CommitEntity
import com.inso_world.binocular.infrastructure.arangodb.persistence.entity.FileEntity
import org.springframework.data.annotation.Id

/**
 * ArangoDB-specific entity for a connection between a Commit and a File.
 */
@Edge(value = "commits-files")
data class CommitFileConnectionEntity(
    @Id var id: String? = null,
    @From var from: CommitEntity,
    @To var to: FileEntity,
    var lineCount: Int? = null,
    var additions: Int? = null,
    var deletions: Int? = null,
)
