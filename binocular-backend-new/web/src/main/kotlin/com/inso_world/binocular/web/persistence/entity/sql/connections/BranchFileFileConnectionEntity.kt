package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.FileEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between a BranchFile and a File.
 */
@Entity
@Table(name = "branch_file_file_connections")
data class BranchFileFileConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "branch_file_id", insertable = false, updatable = false)
  var branchFileId: String,

  @Column(name = "file_id", insertable = false, updatable = false)
  var fileId: String,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "branch_file_id")
  var branchFile: BranchFileConnectionEntity? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "file_id")
  var toFile: FileEntity? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "branch_file_id", insertable = false, updatable = false)
  var fromFile: FileEntity? = null
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "", null, null, null)
}
