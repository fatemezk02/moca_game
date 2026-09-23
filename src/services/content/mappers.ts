/**
 * Column Name Mappers
 * Maps spreadsheet columns (in English or Persian, flexible casing)
 * to strongly typed internal game data models.
 */

import {
  ArtworkContent,
  GalleryContent,
  QuestionContent,
  StarContent,
  ExperienceContent,
  ExperienceIconType,
  LocationContent,
} from './types';

/**
 * Normalizes a column header string for forgiving comparisons
 * e.g. "Gallery ID" -> "galleryid", "متن_سوال" -> "متنسوال", "Option 1" -> "option1"
 */
export function normalizeKey(key?: string): string {
  if (!key || typeof key !== 'string') return '';
  return key
    .toLowerCase()
    .replace(/[\s_\-–—:\/\\()\[\]]/g, '')
    .trim();
}

/**
 * Finds the value in a row by matching against a list of known alias names
 */
function getValueByAliases(row: Record<string, string>, aliases: string[]): string {
  const normalizedAliases = aliases.map(normalizeKey);
  for (const [rawKey, rawVal] of Object.entries(row)) {
    const normKey = normalizeKey(rawKey);
    if (normalizedAliases.includes(normKey)) {
      return (rawVal || '').trim();
    }
  }
  return '';
}

/**
 * Parses options list from either a single delimiter-separated column
 * (e.g. newline, pipe '|', semicolon ';', comma)
 * OR separate columns (option1, option2, option3, option4, etc.)
 */
function extractOptions(
  row: Record<string, string>,
  optionsColumnAliases: string[],
  singleOptionAliasesPrefix: string[] = ['option', 'opt', 'گزینه']
): string[] {
  // 1. Try single options column with delimiter
  const combined = getValueByAliases(row, optionsColumnAliases);
  if (combined) {
    if (combined.startsWith('[') && combined.endsWith(']')) {
      try {
        const parsed = JSON.parse(combined);
        if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim());
      } catch {}
    }
    if (combined.includes('\n')) {
      return combined.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (combined.includes('|')) {
      return combined.split('|').map((s) => s.trim()).filter(Boolean);
    }
    if (combined.includes(';')) {
      return combined.split(';').map((s) => s.trim()).filter(Boolean);
    }
    if (combined.includes('،')) {
      return combined.split('،').map((s) => s.trim()).filter(Boolean);
    }
  }

  // 2. Check for individual option columns: option1, option2, option3, option4, etc.
  const individualOptions: string[] = [];
  for (let i = 1; i <= 6; i++) {
    const candidateAliases: string[] = [];
    singleOptionAliasesPrefix.forEach((prefix) => {
      candidateAliases.push(`${prefix}${i}`);
      candidateAliases.push(`${prefix}_${i}`);
      candidateAliases.push(`${prefix} ${i}`);
    });
    // Also Persian numbers
    const persianNum = ['۰', '۱', '۲', '۳', '۴', '۵', '۶'][i] || '';
    if (persianNum) {
      candidateAliases.push(`گزینه${persianNum}`);
      candidateAliases.push(`گزینه_${persianNum}`);
      candidateAliases.push(`گزینه ${persianNum}`);
    }
    // Also letter variants: optA, optB, etc.
    const letter = ['a', 'b', 'c', 'd', 'e', 'f'][i - 1];
    if (letter) {
      candidateAliases.push(`opt${letter}`);
      candidateAliases.push(`option${letter}`);
      candidateAliases.push(`گزینه${letter}`);
    }

    const val = getValueByAliases(row, candidateAliases);
    if (val) {
      individualOptions.push(val);
    }
  }

  if (individualOptions.length > 0) {
    return individualOptions;
  }

  // Fallback if combined string had commas
  if (combined && combined.includes(',')) {
    return combined.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return combined ? [combined] : [];
}

/**
 * Normalizes gallery identifier strings into canonical form (e.g. '1', 'gallery-01', 'gallery01' -> 'gallery_01')
 */
export function normalizeGalleryId(raw: string): string {
  if (!raw) return '';
  const clean = raw.toLowerCase().trim().replace(/[\s_\-–—:\/\\()\[\]]/g, '');
  if (!clean) return '';
  if (clean === '1' || clean === '01' || clean === 'g1' || clean === 'g01' || clean === 'gallery1' || clean === 'gallery01') {
    return 'gallery_01';
  }
  if (clean === '2' || clean === '02' || clean === 'g2' || clean === 'g02' || clean === 'gallery2' || clean === 'gallery02') {
    return 'gallery_02';
  }
  if (clean === '3' || clean === '03' || clean === 'g3' || clean === 'g03' || clean === 'gallery3' || clean === 'gallery03') {
    return 'gallery_03';
  }
  if (clean === '4' || clean === '04' || clean === 'g4' || clean === 'g04' || clean === 'gallery4' || clean === 'gallery04') {
    return 'gallery_04';
  }
  if (clean === '5' || clean === '05' || clean === 'g5' || clean === 'g05' || clean === 'gallery5' || clean === 'gallery05') {
    return 'gallery_05';
  }
  if (clean === '6' || clean === '06' || clean === 'g6' || clean === 'g06' || clean === 'gallery6' || clean === 'gallery06') {
    return 'gallery_06';
  }
  if (clean === '7' || clean === '07' || clean === 'g7' || clean === 'g07' || clean === 'gallery7' || clean === 'gallery07') {
    return 'gallery_07';
  }
  if (clean === '8' || clean === '08' || clean === 'g8' || clean === 'g08' || clean === 'gallery8' || clean === 'gallery08') {
    return 'gallery_08';
  }
  if (clean === '9' || clean === '09' || clean === 'g9' || clean === 'g09' || clean === 'gallery9' || clean === 'gallery09') {
    return 'gallery_09';
  }
  if (clean === '0' || clean === '00' || clean === 'g0' || clean === 'g00' || clean === 'gallery0' || clean === 'gallery00') {
    return 'gallery_00';
  }
  if (clean.startsWith('gallery')) {
    const num = clean.replace('gallery', '');
    if (num.length === 1) return `gallery_0${num}`;
    return `gallery_${num}`;
  }
  if (/^\d+$/.test(clean)) {
    const n = parseInt(clean, 10);
    return n < 10 ? `gallery_0${n}` : `gallery_${n}`;
  }
  return (raw || '').replace(/-/g, '_');
}

/**
 * Maps any gallery identifier (canonical 'gallery_01'..'gallery_08', view routes 'gallery-01'..'gallery-09',
 * or numbers) to the standard 1-based logical gallery number (1 to 8, or 0 for lobby).
 */
export function getLogicalGalleryNumber(galleryId?: string): number | null {
  if (!galleryId || typeof galleryId !== 'string') return null;
  const s = galleryId.toLowerCase().trim();

  if (s === 'gallery-00' || s === 'gallery_00' || s === '00' || s === '0' || s === 'main-map') return 0;
  if (s === 'gallery-01' || s === 'gallery_01' || s === 'gallery01' || s === '01' || s === '1') return 1;
  if (s === 'gallery-02' || s === 'gallery_02' || s === 'gallery02' || s === '02' || s === '2') return 2;
  if (s === 'gallery-03' || s === 'gallery_03' || s === 'gallery03' || s === '03' || s === '3') return 3;
  if (s === 'gallery-04' || s === 'gallery_04' || s === 'gallery04' || s === '04' || s === '4') return 4;
  if (s === 'gallery-05' || s === 'gallery_05' || s === 'gallery05' || s === '05' || s === '5') return 5;
  if (s === 'gallery-06' || s === 'gallery_06' || s === 'gallery06' || s === '06' || s === '6') return 6;
  if (s === 'gallery-07' || s === 'gallery_07' || s === 'gallery07' || s === '07' || s === '7') return 7;
  if (s === 'gallery-08' || s === 'gallery_08' || s === 'gallery08' || s === '08' || s === '8') return 8;

  const m = s.match(/\d+/);
  if (m) {
    const num = parseInt(m[0], 10);
    if (num >= 1 && num <= 8) return num;
  }
  return null;
}

/**
 * ============================================================================
 * 1. MAPPER: Spreadsheet Row -> QuestionContent
 * ============================================================================
 * Supported Column Names in 'Questions' Sheet:
 * - question_id / id / ID / شناسه / کد
 * - gallery_id / galleryId / gallery / گالری
 * - puzzle_point_id / puzzlepointid / نقطه پازل
 * - question_order / questionorder / order / ترتیب
 * - question_fa / پرسش_فارسی / متن_فارسی
 * - question_en / پرسش_انگلیسی / متن_انگلیسی
 * - option_a_fa, option_b_fa, option_c_fa, option_d_fa
 * - option_a_en, option_b_en, option_c_en, option_d_en
 * - correct_option / correctanswer / پاسخ صحیح / گزینه صحیح
 * - reward_coins / reward / پاداش / سکه
 * - active / فعال (true / false)
 */
export function mapRowToQuestion(row: Record<string, string>, index: number): QuestionContent {
  const id =
    getValueByAliases(row, ['question_id', 'questionid', 'id', 'ID', 'شناسه', 'کد']) ||
    String(index + 1);

  const rawGalleryId = getValueByAliases(row, ['gallery_id', 'galleryid', 'gallery', 'گالری', 'شناسه گالری']);
  const galleryId = normalizeGalleryId(rawGalleryId);

  const puzzlePointId =
    getValueByAliases(row, [
      'puzzle_point_id',
      'puzzlepointid',
      'puzzle_point',
      'puzzlepoint',
      'point_id',
      'pointid',
      'نقطه پازل',
      'شناسه نقطه پازل',
    ]) || undefined;

  const rawOrder = getValueByAliases(row, ['question_order', 'questionorder', 'order', 'ترتیب', 'شماره سوال']);
  const questionOrder = rawOrder ? parseInt(rawOrder, 10) : index + 1;

  const questionFa = getValueByAliases(row, ['question_fa', 'questionfa', 'پرسش_فارسی', 'متن_فارسی', 'سوال_فارسی']);
  const questionEn = getValueByAliases(row, ['question_en', 'questionen', 'پرسش_انگلیسی', 'متن_انگلیسی', 'سوال_انگلیسی']);
  const generalQuestion = getValueByAliases(row, ['question', 'پرسش', 'متن سوال', 'text', 'سوال']);
  const question = questionFa || generalQuestion || questionEn || '';

  // Parse Persian options: option_a_fa, option_b_fa, option_c_fa, option_d_fa
  const optAFa = getValueByAliases(row, ['option_a_fa', 'optionafa', 'گزینه_الف_فارسی', 'گزینه_الف', 'opt_a_fa', 'optafa']);
  const optBFa = getValueByAliases(row, ['option_b_fa', 'optionbfa', 'گزینه_ب_فارسی', 'گزینه_ب', 'opt_b_fa', 'optbfa']);
  const optCFa = getValueByAliases(row, ['option_c_fa', 'optioncfa', 'گزینه_ج_فارسی', 'گزینه_ج', 'opt_c_fa', 'optcfa']);
  const optDFa = getValueByAliases(row, ['option_d_fa', 'optiondfa', 'گزینه_د_فارسی', 'گزینه_د', 'opt_d_fa', 'optdfa']);
  const optionsFa = [optAFa, optBFa, optCFa, optDFa].filter(Boolean);

  // Parse English options: option_a_en, option_b_en, option_c_en, option_d_en
  const optAEn = getValueByAliases(row, ['option_a_en', 'optionaen', 'opt_a_en', 'optaen']);
  const optBEn = getValueByAliases(row, ['option_b_en', 'optionben', 'opt_b_en', 'optben']);
  const optCEn = getValueByAliases(row, ['option_c_en', 'optioncen', 'opt_c_en', 'optcen']);
  const optDEn = getValueByAliases(row, ['option_d_en', 'optionden', 'opt_d_en', 'optden']);
  const optionsEn = [optAEn, optBEn, optCEn, optDEn].filter(Boolean);

  // Fallback to general option parsing
  const generalOptions = extractOptions(
    row,
    ['options', 'گزینه ها', 'گزینه‌ها', 'پاسخ ها', 'لیست گزینه ها'],
    ['option', 'opt', 'گزینه']
  );

  const options =
    optionsFa.length > 0
      ? optionsFa
      : optionsEn.length > 0
      ? optionsEn
      : generalOptions.length > 0
      ? generalOptions
      : [];

  const correctOption = getValueByAliases(row, [
    'correct_option',
    'correctoption',
    'correctanswer',
    'correct_answer',
    'پاسخ صحیح',
    'جواب صحیح',
    'جواب',
    'پاسخ',
    'گزینه صحیح',
  ]);

  const rawCorrectIndex = getValueByAliases(row, [
    'correctindex',
    'شماره گزینه صحیح',
    'ایندکس صحیح',
  ]);

  let correctIndex = -1;
  if (correctOption) {
    const norm = correctOption.toLowerCase().trim();
    if (norm === 'a' || norm === 'الف' || norm === 'opt_a' || norm === 'option_a') {
      correctIndex = 0;
    } else if (norm === 'b' || norm === 'ب' || norm === 'opt_b' || norm === 'option_b') {
      correctIndex = 1;
    } else if (norm === 'c' || norm === 'ج' || norm === 'opt_c' || norm === 'option_c') {
      correctIndex = 2;
    } else if (norm === 'd' || norm === 'د' || norm === 'opt_d' || norm === 'option_d') {
      correctIndex = 3;
    } else if (norm === '1') {
      correctIndex = 0;
    } else if (norm === '2') {
      correctIndex = 1;
    } else if (norm === '3') {
      correctIndex = 2;
    } else if (norm === '4') {
      correctIndex = 3;
    } else if (norm === '0') {
      correctIndex = 0;
    } else if (options.length > 0) {
      const foundIdx = options.findIndex(
        (opt) =>
          opt &&
          (opt.trim().toLowerCase() === norm ||
            (typeof opt === 'string' && opt.toLowerCase().includes(norm)))
      );
      if (foundIdx !== -1) {
        correctIndex = foundIdx;
      }
    }
  }

  if (correctIndex === -1 && rawCorrectIndex !== '') {
    const parsedIdx = parseInt(rawCorrectIndex, 10);
    if (!isNaN(parsedIdx)) {
      correctIndex = parsedIdx >= 1 && parsedIdx <= options.length ? parsedIdx - 1 : parsedIdx;
    }
  }

  // If still not determined, detect historical answer if known, otherwise default to 0
  if (correctIndex === -1 && options.length > 0) {
    const caloIdx = options.findIndex(
      (o) =>
        o &&
        typeof o === 'string' &&
        (o.includes('کالوتایپ') || o.toLowerCase().includes('calotype'))
    );
    correctIndex = caloIdx >= 0 ? caloIdx : 0;
  } else if (correctIndex === -1) {
    correctIndex = 0;
  }

  const correctAnswer =
    correctOption || (options[correctIndex] !== undefined ? options[correctIndex] : '');

  const rawReward = getValueByAliases(row, ['reward_coins', 'rewardcoins', 'reward', 'پاداش', 'سکه', 'امتیاز']);
  const reward = rawReward ? parseInt(rawReward, 10) || 50 : 50;

  const rawActive = (getValueByAliases(row, ['active', 'is_active', 'isactive', 'فعال']) || '').toLowerCase().trim();
  let active = true;
  if (rawActive === 'false' || rawActive === '0' || rawActive === 'no' || rawActive === 'غیرفعال') {
    active = false;
  } else if (rawActive === 'true' || rawActive === '1' || rawActive === 'yes' || rawActive === 'فعال') {
    active = true;
  } else if (rawActive === '') {
    // If active column is empty in sheet, treat as active if it has actual question text
    active = Boolean(questionFa || questionEn || generalQuestion);
  }

  const rawTitle = getValueByAliases(row, ['title', 'عنوان', 'نام سوال']);
  const title = rawTitle || (puzzlePointId ? `نقطه پازل ${puzzlePointId}` : `پرسش ${index + 1}`);

  const explanation = getValueByAliases(row, ['explanation', 'توضیح', 'شرح', 'راهنما']);
  const categoryRaw = (getValueByAliases(row, ['category', 'نوع', 'دسته بندی', 'نوع سوال']) || '').toLowerCase();
  const category: QuestionContent['category'] =
    categoryRaw.includes('puzzle') || categoryRaw.includes('پازل') || Boolean(puzzlePointId)
      ? 'puzzle'
      : categoryRaw.includes('star') || categoryRaw.includes('ستاره')
      ? 'star'
      : 'gallery';

  const puzzlePieceId = getValueByAliases(row, ['puzzlepieceid', 'قطعه پازل', 'شناسه پازل', 'pieceid']);

  const rawArtworkId = getValueByAliases(row, [
    'artwork_id',
    'artworkid',
    'artwork',
    'art_id',
    'artid',
    'شناسه اثر',
    'شناسه_اثر',
    'کد اثر',
    'کد_اثر',
    'تصویر اثر',
    'عکس اثر',
    'آرت ورک',
  ]);
  const artworkId = rawArtworkId ? rawArtworkId.trim() : undefined;

  return {
    id,
    galleryId,
    puzzlePointId,
    questionOrder,
    title,
    question,
    questionFa: questionFa || undefined,
    questionEn: questionEn || undefined,
    options,
    optionsFa: optionsFa.length > 0 ? optionsFa : undefined,
    optionsEn: optionsEn.length > 0 ? optionsEn : undefined,
    correctOption: correctOption || undefined,
    correctAnswer,
    correctIndex,
    explanation,
    category,
    reward,
    active,
    puzzlePieceId: puzzlePieceId || undefined,
    artworkId,
    rawFields: row,
  };
}

/**
 * ============================================================================
 * 2. MAPPER: Spreadsheet Row -> StarContent
 * ============================================================================
 * Expected / Supported Column Names in 'Stars' Sheet:
 * - ID / id / شناسه (e.g. artwork-01, col-01, artwork-g03-star)
 * - galleryId / gallery / گالری (e.g. gallery-01, gallery-00, gallery-03)
 * - labelTextFa / label / متن لیبل (e.g. "ردپای عکاسی را در گذر زمان دنبال کن")
 * - titleFa / title / عنوان (e.g. "عکاسی در گذر زمان")
 * - introFa / intro / مقدمه (e.g. "تحولات مهم تاریخ عکاسی رو دنبال کن")
 * - discoveryCost / هزینه کشف (default: 30)
 * - informationCost / هزینه اطلاعات (default: 30)
 * - question / سوال / متن سوال
 * - options / گزینه ها (option1, option2, option3)
 * - correctAnswer / پاسخ صحیح
 * - correctIndex / شماره گزینه صحیح
 * - reward / پاداش (default: 50)
 * - wrongReward / پاداش غلط (default: 0)
 * - explanation / توضیح
 * - artworkImageUrl / image / تصویر / عکس
 * - artworkTextFa / textFa / متن فارسی
 * - artworkTextEn / textEn / متن انگلیسی
 */
export function mapRowToStar(row: Record<string, string>, index: number): StarContent {
  const rawId =
    getValueByAliases(row, [
      'star_id',
      'starid',
      'star_point_id',
      'starpointid',
      'id',
      'ID',
      'شناسه',
      'کد ستاره',
      'کد',
    ]) || `${index + 1}`;

  const id = rawId.trim();
  const starId = id;

  const rawStarNumber = getValueByAliases(row, [
    'star_number',
    'starnumber',
    'star_no',
    'starno',
    'star_num',
    'starnum',
    'شماره ستاره',
    'شماره_ستاره',
    'شماره',
    'عدد ستاره',
    'ردیف',
  ]);
  const numInIdMatch = id ? id.match(/\d+/)?.[0] : null;
  const starNumber = rawStarNumber
    ? rawStarNumber.trim()
    : numInIdMatch
    ? parseInt(numInIdMatch, 10).toString()
    : `${index + 1}`;

  const rawQuestionId = getValueByAliases(row, [
    'question_id',
    'questionid',
    'star_question_id',
    'starquestionid',
    'question_code',
    'questioncode',
    'qid',
    'شناسه سوال',
    'شناسه_سوال',
    'کد سوال',
    'کد_سوال',
    'شناسه پرسش',
    'کد پرسش',
  ]);

  let questionId = '';
  if (rawQuestionId) {
    const trimmedQ = rawQuestionId.trim();
    if (trimmedQ.toLowerCase().startsWith('star-q-')) {
      questionId = trimmedQ;
    } else {
      const numMatch = trimmedQ ? trimmedQ.match(/\d+/)?.[0] : null;
      if (numMatch) {
        questionId = `star-q-${numMatch.padStart(2, '0')}`;
      } else {
        questionId = trimmedQ;
      }
    }
  } else {
    const numMatch = id ? id.match(/\d+/)?.[0] : null;
    questionId = numMatch ? `star-q-${numMatch.padStart(2, '0')}` : `star-q-01`;
  }

  const rawGalleryId =
    getValueByAliases(row, [
      'gallery_id',
      'galleryid',
      'gallery',
      'گالری',
      'شناسه گالری',
    ]) || 'gallery-01';
  let galleryId = normalizeGalleryId(rawGalleryId);

  const labelTextFa =
    getValueByAliases(row, [
      'label_fa',
      'labelfa',
      'label_text_fa',
      'labeltextfa',
      'labeltext',
      'label',
      'متن لیبل',
      'لیبل',
      'پیام',
    ]) || 'ردپای عکاسی را در گذر زمان دنبال کن';

  const titleFa =
    getValueByAliases(row, [
      'title_fa',
      'titlefa',
      'title',
      'عنوان',
      'نام اثر',
      'نام',
    ]) || `نقطه کشف ستاره ${index + 1}`;

  const introFa =
    getValueByAliases(row, [
      'intro_fa',
      'introfa',
      'intro',
      'مقدمه',
      'توضیح کوتاه',
      'شرح اولیه',
    ]) || labelTextFa;

  const rawInfoCost = getValueByAliases(row, [
    'information_cost_coins',
    'informationcostcoins',
    'informationcost',
    'information_cost',
    'discoverycost',
    'هزینه اطلاعات',
    'هزینه بازگشایی',
    'هزینه کشف',
    'هزینه',
  ]);
  const informationCost = rawInfoCost ? parseInt(rawInfoCost, 10) || 30 : 30;
  const discoveryCost = informationCost;

  const questionText =
    getValueByAliases(row, [
      'question_fa',
      'questionfa',
      'question',
      'questiontext',
      'متن سوال',
      'پرسش',
      'سوال',
    ]) || 'ویژگی شاخص این اثر چیست؟';

  // Specific options columns from Google Sheets: option_a_fa, option_b_fa, option_c_fa, option_d_fa
  const optAFa = getValueByAliases(row, ['option_a_fa', 'optionafa', 'option_a', 'گزینه_الف_فارسی', 'گزینه_الف', 'opt_a_fa', 'optafa']);
  const optBFa = getValueByAliases(row, ['option_b_fa', 'optionbfa', 'option_b', 'گزینه_ب_فارسی', 'گزینه_ب', 'opt_b_fa', 'optbfa']);
  const optCFa = getValueByAliases(row, ['option_c_fa', 'optioncfa', 'option_c', 'گزینه_ج_فارسی', 'گزینه_ج', 'opt_c_fa', 'optcfa']);
  const optDFa = getValueByAliases(row, ['option_d_fa', 'optiondfa', 'option_d', 'گزینه_د_فارسی', 'گزینه_د', 'opt_d_fa', 'optdfa']);
  const optionsFa = [optAFa, optBFa, optCFa, optDFa].filter(Boolean);

  const fallbackOptions = extractOptions(
    row,
    ['options', 'گزینه ها', 'گزینه‌ها', 'پاسخ ها'],
    ['option', 'opt', 'گزینه']
  );

  const questionOptions = optionsFa.length > 0 ? optionsFa : (fallbackOptions.length > 0 ? fallbackOptions : ['گزینه الف', 'گزینه ب', 'گزینه ج']);

  // Correct answer resolution
  const correctOption = getValueByAliases(row, [
    'correct_option',
    'correctoption',
    'correctanswer',
    'correct_answer',
    'پاسخ صحیح',
    'جواب صحیح',
    'پاسخ',
    'جواب',
    'گزینه صحیح',
  ]);

  const rawCorrectIndex = getValueByAliases(row, [
    'correct_index',
    'correctindex',
    'شماره گزینه صحیح',
    'ایندکس صحیح',
  ]);

  let correctIndex = 0;
  if (rawCorrectIndex !== '') {
    const parsedIdx = parseInt(rawCorrectIndex, 10);
    if (!isNaN(parsedIdx)) {
      correctIndex = parsedIdx >= 1 && parsedIdx <= questionOptions.length ? parsedIdx - 1 : parsedIdx;
    }
  } else if (correctOption) {
    const norm = correctOption.toLowerCase().trim();
    if (norm === 'a' || norm === 'الف' || norm === '1') correctIndex = 0;
    else if (norm === 'b' || norm === 'ب' || norm === '2') correctIndex = 1;
    else if (norm === 'c' || norm === 'ج' || norm === '3') correctIndex = 2;
    else if (norm === 'd' || norm === 'د' || norm === '4') correctIndex = 3;
    else {
      const foundIdx = questionOptions.findIndex(
        (opt) => opt.trim() === correctOption.trim() || opt.includes(correctOption.trim())
      );
      if (foundIdx !== -1) {
        correctIndex = foundIdx;
      }
    }
  }

  const correctAnswer = (questionOptions[correctIndex] || correctOption || '').trim();

  const rawReward = getValueByAliases(row, [
    'correct_reward_coins',
    'correctrewardcoins',
    'reward',
    'پاداش',
    'سکه پاداش',
    'جایزه',
  ]);
  const reward = rawReward ? parseInt(rawReward, 10) || 50 : 50;

  const rawWrongReward = getValueByAliases(row, [
    'wrong_reward_coins',
    'wrongrewardcoins',
    'wrongreward',
    'پاداش پاسخ غلط',
  ]);
  const wrongReward = rawWrongReward ? parseInt(rawWrongReward, 10) || 0 : 0;

  const explanation = getValueByAliases(row, ['explanation', 'توضیح', 'شرح پاسخ']);

  const artworkImageUrl =
    getValueByAliases(row, [
      'artwork_image_url',
      'artworkimageurl',
      'image_url',
      'imageurl',
      'artworkimage',
      'image',
      'تصویر',
      'عکس',
      'لینک عکس',
    ]) || '';

  const artworkTextFa =
    getValueByAliases(row, [
      'information_text_fa',
      'informationtextfa',
      'artworktextfa',
      'textfa',
      'متن فارسی',
      'توضیحات فارسی',
      'شرح اثر',
    ]) || 'اطلاعات و تاریخچه این شاهکار هنری در گالری ثبت شده است.';

  const artworkTextEn =
    getValueByAliases(row, [
      'information_text_en',
      'informationtexten',
      'artworktexten',
      'texten',
      'متن انگلیسی',
      'توضیحات انگلیسی',
    ]) || '';

  const rawActive = (getValueByAliases(row, ['is_active', 'isactive', 'active', 'فعال']) || '').toLowerCase().trim();
  const active = rawActive === 'false' || rawActive === '0' || rawActive === 'no' || rawActive === 'غیرفعال' ? false : true;

  const artworkId = getValueByAliases(row, [
    'artwork_id',
    'artworkid',
    'artwork',
    'art_id',
    'artid',
    'شناسه اثر',
    'شناسه_اثر',
    'کد اثر',
    'کد_اثر',
    'اثر',
  ]);

  return {
    id,
    starId,
    starNumber,
    questionId,
    galleryId,
    artworkId: artworkId ? artworkId.trim() : undefined,
    labelTextFa,
    titleFa,
    introFa,
    discoveryCost,
    informationCost,
    questionText,
    questionOptions,
    correctAnswer,
    correctIndex,
    reward,
    wrongReward,
    explanation,
    artworkImageUrl,
    artworkTextFa,
    artworkTextEn,
    active,
    rawFields: row,
  };
}

/**
 * ============================================================================
 * 3. MAPPER: Spreadsheet Row -> ArtworkContent
 * ============================================================================
 * Expected / Supported Column Names in 'Artworks' Sheet:
 * - artwork_id / ID / id / شناسه (e.g. 1, 2, 26, 27, artwork-01, art-101)
 * - galleryId / gallery / گالری (e.g. gallery-01, gallery-00)
 * - title / عنوان / نام اثر
 * - roomSection / section / بخش / تالار
 * - x / X / مختصات x
 * - y / Y / مختصات y
 * - period / دوره تاریخی
 * - artistOrCulture / artist / هنرمند / خالق
 * - medium / متریال / تکنیک
 * - year / سال ساخت
 * - dimensions / ابعاد
 * - description / توضیحات / شرح
 * - imageUrl / image_url / image / عکس / تصویر
 */
export function mapRowToArtwork(row: Record<string, string>, index: number): ArtworkContent {
  const rawId =
    getValueByAliases(row, [
      'artwork_id',
      'artworkid',
      'id',
      'ID',
      'شناسه اثر',
      'شناسه_اثر',
      'شناسه',
      'کد اثر',
      'کد_اثر',
      'کد',
    ]) || `artwork-${index + 1}`;
  const id = rawId.trim();
  const artworkId = id;

  const galleryId =
    getValueByAliases(row, ['galleryid', 'gallery', 'گالری', 'شناسه گالری']) ||
    'gallery-01';

  const title =
    getValueByAliases(row, ['title', 'عنوان', 'نام اثر', 'نام']) ||
    `اثر هنری ${index + 1}`;

  const roomSection = getValueByAliases(row, ['roomsection', 'section', 'بخش', 'تالار', 'مکان']);

  const rawX = getValueByAliases(row, ['x', 'X', 'mapx', 'مختصات x']);
  const x = rawX !== '' ? parseFloat(rawX) : undefined;

  const rawY = getValueByAliases(row, ['y', 'Y', 'mapy', 'مختصات y']);
  const y = rawY !== '' ? parseFloat(rawY) : undefined;

  const period = getValueByAliases(row, ['period', 'دوره', 'دوره تاریخی', 'عصر']);
  const artistOrCulture = getValueByAliases(row, ['artistorculture', 'artist', 'culture', 'هنرمند', 'خالق']);
  const medium = getValueByAliases(row, ['medium', 'متریال', 'تکنیک', 'جنس']);
  const year = getValueByAliases(row, ['year', 'سال', 'قدمت']);
  const dimensions = getValueByAliases(row, ['dimensions', 'ابعاد', 'اندازه']);
  const description = getValueByAliases(row, ['description', 'توضیحات', 'شرح', 'متن']);
  const imageUrl = getValueByAliases(row, [
    'image_url',
    'imageurl',
    'artwork_image_url',
    'artworkimageurl',
    'image',
    'عکس',
    'تصویر',
    'لینک عکس',
    'لینک تصویر',
  ]);

  return {
    id,
    artworkId,
    galleryId,
    title,
    roomSection: roomSection || undefined,
    x: isNaN(x as any) ? undefined : x,
    y: isNaN(y as any) ? undefined : y,
    period: period || undefined,
    artistOrCulture: artistOrCulture || undefined,
    medium: medium || undefined,
    year: year || undefined,
    dimensions: dimensions || undefined,
    description: description || undefined,
    imageUrl: imageUrl || undefined,
    rawFields: row,
  };
}

/**
 * ============================================================================
 * 4. MAPPER: Spreadsheet Row -> GalleryContent
 * ============================================================================
 * Expected / Supported Column Names in 'Galleries' Sheet:
 * - gallery_id (e.g. gallery-01, gallery-03)
 * - gallery_number (e.g. 01, 1, 03, 3)
 * - name_fa (e.g. کیمیای نور)
 * - name_en (e.g. Gallery 01 Name)
 * - description_fa (e.g. توضیحات گالری ۱)
 * - description_en (e.g. Gallery 01 Description)
 * - active (e.g. true / TRUE)
 * - puzzle_artwork_id / artwork_id (e.g. 26, 27, art-01)
 */
export function mapRowToGallery(row: Record<string, string>, index: number): GalleryContent {
  const rawGalleryId =
    getValueByAliases(row, ['gallery_id', 'galleryid', 'id', 'شناسه گالری', 'گالری']) ||
    `gallery_${String(index).padStart(2, '0')}`;
  const galleryId = normalizeGalleryId(rawGalleryId);

  const galleryNumber =
    getValueByAliases(row, [
      'gallery_number',
      'gallerynumber',
      'number',
      'شماره گالری',
      'شماره',
      'کد گالری',
    ]) || String(index);

  const nameFa =
    getValueByAliases(row, [
      'name_fa',
      'namefa',
      'name',
      'title_fa',
      'title',
      'عنوان',
      'نام گالری',
      'نام فارسی',
      'نام',
    ]) || '';

  const nameEn =
    getValueByAliases(row, [
      'name_en',
      'nameen',
      'english_name',
      'نام انگلیسی',
      'title_en',
    ]) || '';

  const descriptionFa =
    getValueByAliases(row, [
      'description_fa',
      'descriptionfa',
      'description',
      'توضیحات فارسی',
      'توضیحات',
      'شرح',
    ]) || '';

  const descriptionEn =
    getValueByAliases(row, [
      'description_en',
      'descriptionen',
      'english_description',
      'توضیحات انگلیسی',
    ]) || '';

  const curator = getValueByAliases(row, [
    'curator',
    'curator_name',
    'curatorname',
    'guide',
    'guide_name',
    'guidename',
    'کیوریتور',
    'نام کیوریتور',
    'راهنما',
    'نام راهنما',
    'کیوریتور / راهنما',
    'راهنمای گالری',
    'کیوریتور گالری',
  ]);

  const curatorUrl = getValueByAliases(row, [
    'curator_url',
    'curatorurl',
    'curator_image',
    'curatorimage',
    'curator_img',
    'curatorimg',
    'guide_url',
    'guideurl',
    'guide_image',
    'guideimage',
    'تصویر کیوریتور',
    'عکس کیوریتور',
    'تصویر راهنما',
    'عکس راهنما',
    'لینک تصویر کیوریتور',
  ]);

  const puzzleArtworkId = getValueByAliases(row, [
    'puzzle_artwork_id',
    'puzzleartworkid',
    'puzzle_artwork',
    'puzzleartwork',
    'artwork_id',
    'artworkid',
    'artwork',
    'art_id',
    'artid',
    'شناسه اثر پازل',
    'کد اثر پازل',
    'اثر پازل',
    'شناسه اثر',
    'کد اثر',
    'اثر',
  ]);

  const activeRaw = getValueByAliases(row, ['active', 'فعال', 'is_active', 'status']);
  const active =
    activeRaw === ''
      ? true
      : (activeRaw || '').toLowerCase() === 'true' ||
        (activeRaw || '').toLowerCase() === '1' ||
        activeRaw === 'بله' ||
        activeRaw === 'فعال';

  return {
    id: galleryId,
    galleryId,
    galleryNumber,
    nameFa,
    nameEn,
    descriptionFa,
    descriptionEn,
    curator: curator ? curator.trim() : undefined,
    curatorUrl: curatorUrl ? curatorUrl.trim() : undefined,
    puzzleArtworkId: puzzleArtworkId ? puzzleArtworkId.trim() : undefined,
    active,
    rawFields: row,
  };
}

/**
 * Maps a spreadsheet row to a strongly typed ExperienceContent object.
 *
 * Supported column header aliases:
 * - experience_id / experienceid / id / شناسه تجربه / کد تجربه
 * - gallery_id / galleryid / gallery / گالری / تالار
 * - label_fa / lable_fa / label / lable / برچسب / عنوان کوتاه
 * - description_fa / description / desc / توضیحات / متن تجربه
 * - image_url / img_url / image / تصویر / عکس
 * - title / title_fa / عنوان / نام تجربه
 * - icon_id / icon / آیکون
 * - active / is_active / فعال
 */
export function mapRowToExperience(row: Record<string, string>, index: number): ExperienceContent {
  const rawId = getValueByAliases(row, [
    'experience_id',
    'experienceid',
    'experience',
    'id',
    'شناسه تجربه',
    'کد تجربه',
    'شناسه',
  ]);
  const experienceId = rawId ? rawId.trim() : `experience_${index + 1}`;

  const rawGalleryId = getValueByAliases(row, [
    'gallery_id',
    'galleryid',
    'gallery',
    'گالری',
    'تالار',
    'شناسه گالری',
  ]);
  const galleryId = normalizeGalleryId(rawGalleryId) || 'gallery_03';

  const labelFa = getValueByAliases(row, [
    'label_fa',
    'lable_fa',
    'label',
    'lable',
    'برچسب',
    'عنوان کوتاه',
  ]);

  const title = getValueByAliases(row, [
    'title',
    'title_fa',
    'عنوان',
    'نام',
    'نام تجربه',
  ]);

  const descriptionFa = getValueByAliases(row, [
    'description_fa',
    'description',
    'desc',
    'توضیحات',
    'متن',
    'متن تجربه',
  ]);

  const imageUrl = getValueByAliases(row, [
    'image_url',
    'img_url',
    'imageurl',
    'image',
    'photo',
    'تصویر',
    'عکس',
  ]);

  const rawIconId = getValueByAliases(row, [
    'icon_id',
    'iconid',
    'icon',
    'آیکون',
    'طرح آیکون',
  ])
    .toLowerCase()
    .replace(/_/g, '-');

  // Determine iconId
  let iconId: ExperienceIconType = 'frame';
  if (rawIconId) {
    if (rawIconId.includes('frame') || rawIconId.includes('قاب')) {
      iconId = 'frame';
    } else if (
      rawIconId.includes('shadow') ||
      rawIconId.includes('silhouette') ||
      rawIconId.includes('سایه')
    ) {
      iconId = 'shadow-silhouette';
    } else if (
      rawIconId.includes('mirror-selfie') ||
      rawIconId.includes('selfie') ||
      rawIconId.includes('سلفی')
    ) {
      iconId = 'mirror-selfie';
    } else if (
      rawIconId.includes('mirror') ||
      rawIconId.includes('آینه') ||
      rawIconId.includes('اینه')
    ) {
      iconId = 'mirror';
    } else if (
      rawIconId.includes('camera') ||
      rawIconId.includes('vintage') ||
      rawIconId.includes('دوربین')
    ) {
      iconId = 'vintage-camera';
    } else if (
      rawIconId.includes('darkroom') ||
      rawIconId.includes('تاریک') ||
      rawIconId.includes('ظهور')
    ) {
      iconId = 'darkroom';
    } else {
      iconId = rawIconId as ExperienceIconType;
    }
  } else {
    // Default fallback based on experienceId or galleryId / index
    const cleanExpId = experienceId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanExpId.includes('1') || cleanExpId.includes('frame')) {
      iconId = 'frame';
    } else if (
      cleanExpId.includes('2') ||
      cleanExpId.includes('shadow') ||
      cleanExpId.includes('silhouette')
    ) {
      iconId = 'shadow-silhouette';
    } else if (
      cleanExpId.includes('3') ||
      (galleryId === 'gallery_04' && !cleanExpId.includes('selfie'))
    ) {
      iconId = 'mirror';
    } else if (
      cleanExpId.includes('4') ||
      (galleryId === 'gallery_05' && (cleanExpId.includes('camera') || index === 3))
    ) {
      iconId = 'vintage-camera';
    } else if (
      cleanExpId.includes('5') ||
      cleanExpId.includes('selfie') ||
      (galleryId === 'gallery_05' && index === 4)
    ) {
      iconId = 'mirror-selfie';
    } else if (
      cleanExpId.includes('6') ||
      cleanExpId.includes('darkroom') ||
      galleryId === 'gallery_08'
    ) {
      iconId = 'darkroom';
    }
  }

  const activeRaw = getValueByAliases(row, ['active', 'فعال', 'is_active', 'status']);
  const active =
    activeRaw === ''
      ? true
      : (activeRaw || '').toLowerCase() === 'true' ||
        (activeRaw || '').toLowerCase() === '1' ||
        activeRaw === 'بله' ||
        activeRaw === 'فعال';

  return {
    id: experienceId,
    experienceId,
    galleryId,
    labelFa: labelFa || title || experienceId,
    title: title || labelFa,
    descriptionFa,
    imageUrl: imageUrl || undefined,
    iconId,
    active,
    rawFields: row,
  };
}

/**
  * Maps a spreadsheet row to a strongly typed LocationContent object.
  *
  * Supported column header aliases:
  * - Location_id / location_id / locationid / id / شناسه لوکیشن / کد لوکیشن / شناسه
  * - name / title / title_fa / name_fa / عنوان / نام / نام لوکیشن / نام نقطه / نام مکان
  * - description / desc / description_fa / توضیحات / شرح / متن / متن لوکیشن
  * - active / is_active / فعال / وضعیت
  */
export function mapRowToLocation(row: Record<string, string>, index: number): LocationContent {
  const rawId = getValueByAliases(row, [
    'location_id',
    'locationid',
    'location',
    'id',
    'point_id',
    'pointid',
    'شناسه لوکیشن',
    'کد لوکیشن',
    'شناسه مکان',
    'کد مکان',
    'شناسه',
  ]);
  const locationId = rawId ? rawId.trim() : `location_${index + 1}`;

  const name =
    getValueByAliases(row, [
      'name',
      'name_fa',
      'namefa',
      'نام',
      'نام لوکیشن',
      'نام مکان',
    ]) ||
    getValueByAliases(row, [
      'title',
      'title_fa',
      'titlefa',
      'عنوان',
      'عنوان لوکیشن',
    ]);

  const title = getValueByAliases(row, [
    'title',
    'title_fa',
    'titlefa',
    'عنوان',
    'عنوان لوکیشن',
    'موضوع',
    'دسته‌بندی',
    'دسته',
  ]);

  const description = getValueByAliases(row, [
    'description',
    'description_fa',
    'descriptionfa',
    'desc',
    'details',
    'توضیحات',
    'شرح',
    'متن',
    'توضیح',
    'متن لوکیشن',
  ]);

  const activeRaw = getValueByAliases(row, ['active', 'فعال', 'is_active', 'status', 'وضعیت']);
  const active =
    activeRaw === ''
      ? Boolean(name || description)
      : (activeRaw || '').toLowerCase() === 'true' ||
        (activeRaw || '').toLowerCase() === '1' ||
        activeRaw === 'بله' ||
        activeRaw === 'فعال' ||
        (activeRaw || '').toLowerCase() === 'yes';

  return {
    id: locationId,
    locationId,
    name: name.trim(),
    title: title.trim() || undefined,
    description: description.trim(),
    active,
    rawFields: row,
  };
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts English digits (0-9) to Persian digits (۰-۹)
 */
export function toPersianDigits(val: number | string): string {
  if (val === undefined || val === null) return '';
  return String(val).replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w]);
}

/**
 * Formats a number with two-digit Persian numerals (e.g. 1 -> "۰۱", 3 -> "۰۳", "01" -> "۰۱")
 */
export function formatTwoDigitPersian(val: number | string): string {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  const numOnly = str.replace(/[^0-9]/g, '');
  const parsed = parseInt(numOnly, 10);
  if (isNaN(parsed)) {
    return toPersianDigits(str);
  }
  const padded = parsed < 10 && parsed >= 0 ? `0${parsed}` : `${parsed}`;
  return toPersianDigits(padded);
}
