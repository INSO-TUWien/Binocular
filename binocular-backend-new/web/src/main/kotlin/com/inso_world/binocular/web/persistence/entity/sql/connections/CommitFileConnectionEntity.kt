package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.CommitEntity
import com.inso_world.binocular.web.persistence.entity.sql.FileEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between a Commit and a File.
 */
@Entity
@Table(name = "commit_file_connections")
data class CommitFileConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "commit_id", insertable = false, updatable = false)
  var commitId: String,

  @Column(name = "file_id", insertable = false, updatable = false)
  var fileId: String,

  @Column(name = "line_count")
  var lineCount: Int? = null
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "", null)
}
