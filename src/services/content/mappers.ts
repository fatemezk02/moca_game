/**
 * Column Name Mappers
 * Maps spreadsheet columns (in English or Persian, flexible casing)
 * to strongly typed internal game data models.
 */

import { ArtworkContent, GalleryContent, QuestionContent, StarContent } from './types';

/**
 * Normalizes a column header string for forgiving comparisons
 * e.g. "Gallery ID" -> "galleryid", "متن_سوال" -> "متنسوال", "Option 1" -> "option1"
 */
export function normalizeKey(key: string): string {
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
 * Normalizes gallery identifier strings into canonical form (e.g. '1' -> 'gallery-01')
 */
export function normalizeGalleryId(raw: string): string {
  if (!raw) return 'gallery-01';
  const clean = raw.toLowerCase().trim().replace(/[\s_\-–—:\/\\()\[\]]/g, '');
  if (clean === '1' || clean === '01' || clean === 'g1' || clean === 'g01' || clean === 'gallery1' || clean === 'gallery01') {
    return 'gallery-01';
  }
  if (clean === '2' || clean === '02' || clean === 'g2' || clean === 'g02' || clean === 'gallery2' || clean === 'gallery02') {
    return 'gallery-02';
  }
  if (clean === '3' || clean === '03' || clean === 'g3' || clean === 'g03' || clean === 'gallery3' || clean === 'gallery03') {
    return 'gallery-03';
  }
  if (clean === '0' || clean === '00' || clean === 'g0' || clean === 'g00' || clean === 'gallery0' || clean === 'gallery00') {
    return 'gallery-00';
  }
  if (clean.startsWith('gallery')) {
    const num = clean.replace('gallery', '');
    if (num.length === 1) return `gallery-0${num}`;
    return `gallery-${num}`;
  }
  return raw;
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
        (opt) => opt.trim().toLowerCase() === norm || opt.toLowerCase().includes(norm)
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
      (o) => o.includes('کالوتایپ') || o.toLowerCase().includes('calotype')
    );
    correctIndex = caloIdx >= 0 ? caloIdx : 0;
  } else if (correctIndex === -1) {
    correctIndex = 0;
  }

  const correctAnswer =
    correctOption || (options[correctIndex] !== undefined ? options[correctIndex] : '');

  const rawReward = getValueByAliases(row, ['reward_coins', 'rewardcoins', 'reward', 'پاداش', 'سکه', 'امتیاز']);
  const reward = rawReward ? parseInt(rawReward, 10) || 50 : 50;

  const rawActive = getValueByAliases(row, ['active', 'is_active', 'isactive', 'فعال']).toLowerCase().trim();
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
  const categoryRaw = getValueByAliases(row, ['category', 'نوع', 'دسته بندی', 'نوع سوال']).toLowerCase();
  const category: QuestionContent['category'] =
    categoryRaw.includes('puzzle') || categoryRaw.includes('پازل') || Boolean(puzzlePointId)
      ? 'puzzle'
      : categoryRaw.includes('star') || categoryRaw.includes('ستاره')
      ? 'star'
      : 'gallery';

  const puzzlePieceId = getValueByAliases(row, ['puzzlepieceid', 'قطعه پازل', 'شناسه پازل', 'pieceid']);

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
      const numMatch = trimmedQ.match(/\d+/)?.[0];
      if (numMatch) {
        questionId = `star-q-${numMatch.padStart(2, '0')}`;
      } else {
        questionId = trimmedQ;
      }
    }
  } else {
    const numMatch = id.match(/\d+/)?.[0];
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
  const galleryId = normalizeGalleryId(rawGalleryId);

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

  const rawActive = getValueByAliases(row, ['is_active', 'isactive', 'active', 'فعال']).toLowerCase().trim();
  const active = rawActive === 'false' || rawActive === '0' || rawActive === 'no' || rawActive === 'غیرفعال' ? false : true;

  return {
    id,
    starId,
    questionId,
    galleryId,
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
 * - ID / id / شناسه (e.g. artwork-01, art-101)
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
 * - imageUrl / image / عکس / تصویر
 */
export function mapRowToArtwork(row: Record<string, string>, index: number): ArtworkContent {
  const id =
    getValueByAliases(row, ['id', 'ID', 'شناسه', 'کد اثر']) ||
    `artwork-${index + 1}`;

  const galleryId =
    getValueByAliases(row, ['galleryid', 'gallery', 'گالری']) ||
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
  const imageUrl = getValueByAliases(row, ['imageurl', 'image', 'عکس', 'تصویر', 'لینک عکس']);

  return {
    id,
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
 */
export function mapRowToGallery(row: Record<string, string>, index: number): GalleryContent {
  const galleryId =
    getValueByAliases(row, ['gallery_id', 'galleryid', 'id', 'شناسه گالری', 'گالری']) ||
    `gallery-${String(index).padStart(2, '0')}`;

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

  const activeRaw = getValueByAliases(row, ['active', 'فعال', 'is_active', 'status']);
  const active =
    activeRaw === ''
      ? true
      : activeRaw.toLowerCase() === 'true' ||
        activeRaw.toLowerCase() === '1' ||
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
