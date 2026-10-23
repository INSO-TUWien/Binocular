package com.inso_world.binocular.infrastructure.arangodb.persistence.converter

import org.springframework.core.convert.converter.Converter
import org.springframework.data.convert.ReadingConverter
import org.springframework.data.convert.WritingConverter
import kotlin.uuid.Uuid

/**
 * Converter to write Kotlin [Uuid] to String for ArangoDB storage.
 */
@WritingConverter
class UuidToStringConverter : Converter<Uuid, String> {
    override fun convert(source: Uuid): String = source.toString()
}

/**
 * Converter to read String from ArangoDB and convert to Kotlin [Uuid].
 */
@ReadingConverter
class StringToUuidConverter : Converter<String, Uuid> {
    override fun convert(source: String): Uuid = Uuid.parse(source)
}
