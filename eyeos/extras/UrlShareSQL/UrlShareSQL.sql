-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `urlfile`
--

CREATE TABLE IF NOT EXISTS `urlfile` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `path` (`path`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `urlshare`
--

CREATE TABLE IF NOT EXISTS `urlshare` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL,
  `password` varchar(8) NOT NULL,
  `publicationDate` int(12) NOT NULL,
  `expirationDate` int(12) DEFAULT NULL,
  `lastdownloaddate` int(12) DEFAULT NULL,
  `fileId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fileId` (`fileId`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Filtros para la tabla `urlshare`
--
ALTER TABLE `urlshare`
  ADD CONSTRAINT `urlshare_ibfk_1` FOREIGN KEY (`fileId`) REFERENCES `urlfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
