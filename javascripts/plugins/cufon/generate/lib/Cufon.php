<?php

require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'FontForgeScript.php';
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'SVGFontContainer.php';
require_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'UnicodeRange.php';

class Cufon {

	public static function getUnusedFilename($suffix)
	{
		$filename = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'cufon_';

		do
		{
			$wanted = $filename . uniqid(mt_rand(), true) . $suffix;
		}
		while (file_exists($wanted));

		return $wanted;
	}

	public static function log($message)
	{
		$args = func_get_args();

		array_shift($args);

		error_log(sprintf("[cufon]: %s", vsprintf($message, $args)), 0);
	}

	/**
	 * @param string $file
	 * @param array $options
	 * @return array
	 */
	public static function generate($file, array $options)
	{
		Cufon::log('Processing %s', $file);

		$script = new FontForgeScript();

		$script->open($file);
		$script->flattenCID();
		$script->reEncode('unicode');
		$script->selectNone();
		$script->selectUnicode(0x20); // space

		if (!empty($options['useGlyphCSSRange']) && !empty($options['customGlyphs']))
		{
			$options['glyphs'][] = UnicodeRange::fromCSSValue($options['customGlyphs'])->asHexString();

			$options['customGlyphs'] = '';
		}

		if (!empty($options['glyphs']))
		{
			foreach ($options['glyphs'] as $glyph)
			{
				$ranges = explode(',', $glyph);

				foreach ($ranges as $range)
				{
					if (strpos($range, '-')) // can't be 0 anyway
					{
						// the range regex allows for things like 0xff-0xff-0xff, so we'll
						// just ignore everything between the first and last one.

						$points = explode('-', $range);

						$script->selectUnicodeRange(intval(reset($points), 16), intval(end($points), 16));
					}
					else
					{
						$script->selectUnicode(intval($range, 16));
					}
				}
			}
		}

		if (!empty($options['customGlyphs']))
		{
			$glyphs = preg_split('//u', $options['customGlyphs'], -1, PREG_SPLIT_NO_EMPTY);

			foreach ($glyphs as $glyph)
			{
				$script->selectUnicode(UnicodeRange::getCodePoint($glyph));
			}
		}

		$script->selectInvert();
		$script->detachAndRemoveGlyphs();

		$script->setFontOrder(FontForgeScript::ORDER_CUBIC);

		if (empty($options['disableScaling']))
		{
			$script->scaleToEm($options['emSize']);
		}

		$script->selectAll();
		$script->verticalFlip(0);

		if (!empty($options['simplify']))
		{
			$script->simplify($options['simplifyDelta']);
		}

		$script->roundToInt(1);

		$svgFile = Cufon::getUnusedFilename('.svg');

		Cufon::log('Converting to SVG with filename %s', $svgFile);

		$script->printNameIDs();
		$script->generate($svgFile);

		$output = trim($script->execute());

		$fonts = array();

		$copyright = '';

		if (!empty($output))
		{
			$copyright = self::createJSDocComment(
				"The following copyright notice may not be removed under " .
				"any circumstances.\n\n${output}");
		}

		foreach (new SVGFontContainer($svgFile, $options) as $font)
		{
			$fonts[$font->getFaceBasedId()] = sprintf("%s%s(%s);\n",
				$copyright,
				isset($options['callback']) ? $options['callback'] : '',
				$font->toJavaScript()
			);
		}

		unlink($svgFile);

		return $fonts;
	}

	/**
	 * @return string
	 */
	public static function createJSDocComment($comment)
	{
		if ($comment === '')
		{
			return '';
		}

		$lines = explode("\n", wordwrap(trim($comment), 80));

		for ($i = 0, $l = count($lines); $i < $l; ++$i)
		{
			$lines[$i] = ' * ' . $lines[$i];
		}

		return "/*!\n" . implode("\n", $lines) . "\n */\n";
	}

}
