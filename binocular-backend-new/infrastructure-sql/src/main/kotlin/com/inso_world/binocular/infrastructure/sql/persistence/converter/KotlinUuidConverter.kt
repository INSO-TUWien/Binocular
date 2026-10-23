package com.inso_world.binocular.infrastructure.sql.persistence.converter

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import java.util.UUID
import kotlin.uuid.Uuid
import kotlin.uuid.toJavaUuid
import kotlin.uuid.toKotlinUuid

@Converter
internal class KotlinUuidConverter : AttributeConverter<Uuid, UUID> {
    override fun convertToDatabaseColumn(attribute: Uuid?): UUID? = attribute?.toJavaUuid()

    override fun convertToEntityAttribute(dbData: UUID?): Uuid? = dbData?.toKotlinUuid()
}
