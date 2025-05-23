import { Timestamp, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

let FS; // FirestoreService
let AuthGetCurrentUserId;
let UtilGetWebCardGlobalId;
let UtilGetCardIdentifier;
let AppGetContext; // Hàm để lấy { currentData, currentIndex }
let UICallbacks; // { updateStatusButtons, triggerNextCard, updateMainFlashcard }

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_INTERVAL_DAYS = 365 * 2; // Max interval 2 năm

export function initializeSrsModule(dependencies) {
    FS = dependencies.firestoreService;
    AuthGetCurrentUserId = dependencies.getCurrentUserIdFunc;
    UtilGetWebCardGlobalId = dependencies.getWebCardGlobalIdFunc;
    UtilGetCardIdentifier = dependencies.getCardIdentifierFunc;
    AppGetContext = dependencies.getAppContextFunc;
    UICallbacks = dependencies.uiCallbacks;
    console.log("SRS Module initialized with dependencies.");
}

function calculateSrsParameters(card, ratingQuality) {
    let interval = card.interval || 0;
    let easeFactor = card.easeFactor || DEFAULT_EASE_FACTOR;
    let repetitions = card.repetitions || 0;

    // ratingQuality: 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
    if (ratingQuality < 2) { // Again (0) or Hard (1) 
        repetitions = 0;
        interval = 1; // Reset interval về 1 ngày
        if (ratingQuality === 1) { // Hard
            easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
        } else { // Again
             easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.20);
        }
    } else { // Good (2) or Easy (3)
        repetitions++;
        if (repetitions === 1) {
            interval = 1; // Lần đầu trả lời đúng (Good/Easy)
        } else if (repetitions === 2) {
            interval = 6; // Lần thứ hai trả lời đúng
        } else {
            // Đảm bảo interval không quá nhỏ nếu easeFactor rất thấp
            interval = Math.ceil(Math.max(interval, 1) * easeFactor);
        }
        
        // Điều chỉnh easeFactor dựa trên chất lượng đánh giá (q)
        // Ánh xạ ratingQuality (0-3) sang q_sm2 (0-5) cho công thức SM-2
        let q_sm2;
        if (ratingQuality === 0) q_sm2 = 0;      // Again
        else if (ratingQuality === 1) q_sm2 = 2; // Hard -> tương đương mức thấp của Good trong SM2
        else if (ratingQuality === 2) q_sm2 = 4; // Good
        else q_sm2 = 5;      // Easy

        // Chỉ cập nhật EF nếu nhớ (q_sm2 >=3, tương đương ratingQuality >= 2)
        // Và không giảm EF quá nhiều nếu chỉ là "Good"
        if (q_sm2 >= 3) { 
             easeFactor = easeFactor + (0.1 - (5 - q_sm2) * (0.08 + (5 - q_sm2) * 0.02));
             if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;
        }
    }
    
    interval = Math.min(interval, MAX_INTERVAL_DAYS);
    interval = Math.max(1, interval); // Đảm bảo interval ít nhất là 1 ngày (trừ khi là thẻ mới học lần đầu và đánh giá là Again)

    const now = new Date();
    const nextReviewDateObj = new Date(now.setDate(now.getDate() + interval));
    nextReviewDateObj.setHours(5, 0, 0, 0); // Đặt giờ ôn tập cố định, ví dụ 5 giờ sáng

    return {
        newInterval: interval,
        newEaseFactor: parseFloat(easeFactor.toFixed(2)),
        newRepetitions: repetitions,
        nextReviewDate: Timestamp.fromDate(nextReviewDateObj) 
    };
}

async function updateCardSrsData(cardItem, ratingQuality) {
    if (!cardItem) {
        console.error("SRS: cardItem is undefined in updateCardSrsData");
        return;
    }
    const currentUserId = AuthGetCurrentUserId();
    if (!currentUserId && !cardItem.isUserCard) { 
        console.log("SRS: Người dùng chưa đăng nhập, không cập nhật SRS cho thẻ web.");
        return;
    }

    const srsParams = calculateSrsParameters(cardItem, ratingQuality);
    
    let newStatus = 'learning'; 
    if (srsParams.newInterval >= 21) { 
        newStatus = 'learned';
    }
    if (ratingQuality < 2 && srsParams.newInterval < 21) { // Again or Hard mà interval chưa đủ lớn
         newStatus = 'learning'; 
    }

    const srsDataToUpdate = {
        status: newStatus, 
        lastReviewed: serverTimestamp(),
        reviewCount: (cardItem.reviewCount || 0) + 1,
        nextReviewDate: srsParams.nextReviewDate, 
        interval: srsParams.newInterval,
        easeFactor: srsParams.newEaseFactor,
        repetitions: srsParams.newRepetitions
    };

    let success = false;
    try {
        if (cardItem.isUserCard) {
            if (!currentUserId || !cardItem.deckId || !cardItem.id) {
                console.error("SRS: Thiếu thông tin để cập nhật SRS cho thẻ người dùng.");
                alert("Lỗi: Không tìm thấy thông tin thẻ để cập nhật SRS.");
                return;
            }
            // Sử dụng FirestoreService để cập nhật
            const cardId = await FS.saveCardToFirestore(currentUserId, cardItem.deckId, srsDataToUpdate, cardItem.id);
            success = !!cardId;

        } else if (currentUserId) { 
            const webCardGlobalId = UtilGetWebCardGlobalId(cardItem);
            if (!webCardGlobalId) {
                console.error("SRS: Không thể tạo ID cho thẻ web để cập nhật SRS.");
                alert("Lỗi: Không thể xác định thẻ web để cập nhật SRS.");
                return;
            }
            success = await FS.updateWebCardStatusInFirestore(currentUserId, webCardGlobalId, cardItem, srsDataToUpdate);
        }

        if (success) {
            // Cập nhật đối tượng cardItem ở client
            cardItem.status = srsDataToUpdate.status;
            cardItem.lastReviewed = Date.now(); 
            cardItem.reviewCount = srsDataToUpdate.reviewCount;
            cardItem.nextReviewDate = srsDataToUpdate.nextReviewDate.toDate().getTime(); 
            cardItem.interval = srsDataToUpdate.interval;
            cardItem.easeFactor = srsDataToUpdate.easeFactor;
            cardItem.repetitions = srsDataToUpdate.repetitions;
            console.log("SRS: Dữ liệu SRS đã được cập nhật cho thẻ:", cardItem.id || UtilGetWebCardGlobalId(cardItem));
        } else {
             console.error("SRS: Không thể cập nhật dữ liệu SRS lên Firestore cho thẻ:", cardItem.id || UtilGetWebCardGlobalId(cardItem));
        }
    } catch (error) {
        console.error("SRS: Lỗi khi cập nhật dữ liệu SRS lên Firestore:", error);
        alert("Lỗi cập nhật dữ liệu ôn tập. Vui lòng thử lại.");
    }
    if (UICallbacks && typeof UICallbacks.updateStatusButtons === 'function') {
        UICallbacks.updateStatusButtons(); 
    }
}

export async function processSrsRating(ratingString) {
    if (!AppGetContext || !UICallbacks) {
        console.error("SRS Module not properly initialized or app context/UI callbacks missing.");
        return;
    }
    const { currentData, currentIndex } = AppGetContext();

    if (currentData.length === 0 || currentIndex < 0 || currentIndex >= currentData.length) {
        console.warn("SRS: No current card to process rating.");
        return;
    }
    const cardItem = currentData[currentIndex];
    if (!cardItem) {
        console.warn("SRS: cardItem is undefined at current index.");
        return;
    }

    console.log(`SRS: Rating selected: ${ratingString} for card:`, cardItem.word || cardItem.phrasalVerb || cardItem.collocation);

    let ratingQuality;
    switch (ratingString) {
        case 'again': ratingQuality = 0; break;
        case 'hard': ratingQuality = 1; break; 
        case 'good': ratingQuality = 2; break; 
        case 'easy': ratingQuality = 3; break; 
        default: 
            console.error("SRS: Invalid SRS rating string:", ratingString);
            return;
    }
    
    await updateCardSrsData(cardItem, ratingQuality);

    if (currentIndex < currentData.length - 1) {
        if (UICallbacks && typeof UICallbacks.triggerNextCard === 'function') {
            UICallbacks.triggerNextCard(); 
        }
    } else {
        console.log("SRS: Đã hoàn thành tất cả các thẻ trong danh sách hiện tại.");
        if (UICallbacks && typeof UICallbacks.updateMainFlashcardUI === 'function') {
            UICallbacks.updateMainFlashcardUI(); 
        }
    }
}
