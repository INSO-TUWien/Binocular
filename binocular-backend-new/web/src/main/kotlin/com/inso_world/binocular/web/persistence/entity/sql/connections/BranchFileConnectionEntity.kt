package com.inso_world.binocular.web.persistence.entity.sql.connections

import com.inso_world.binocular.web.persistence.entity.sql.BranchEntity
import com.inso_world.binocular.web.persistence.entity.sql.FileEntity
import jakarta.persistence.*

/**
 * SQL-specific entity for a connection between a Branch and a File.
 */
@Entity
@Table(name = "branch_file_connections")
data class BranchFileConnectionEntity(
  @Id
  var id: String? = null,

  @Column(name = "branch_id", insertable = false, updatable = false)
  var branchId: String,

  @Column(name = "file_id", insertable = false, updatable = false)
  var fileId: String,

  @OneToMany(mappedBy = "branchFile", cascade = [CascadeType.ALL], orphanRemoval = true)
  var fileConnections: MutableList<BranchFileFileConnectionEntity> = mutableListOf()
) {
  // Default constructor for Hibernate
  constructor() : this(null, "", "", mutableListOf())
}
