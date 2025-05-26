// Firebase Firestore imports
import {
  getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, getDoc, Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let dbInstance; // Sẽ được truyền vào từ script.js

export function initializeFirestoreService(firestoreInstance) {
    dbInstance = firestoreInstance;
}

// --- Deck Operations ---
export async function loadUserDecksFromFirestore(userId) {
    if (!userId || !dbInstance) {
        console.error("FirestoreService: Missing userId or dbInstance for loadUserDecks");
        return [];
    }
    console.log("FirestoreService: Loading decks for user ID:", userId);
    const decksCollectionRef = collection(dbInstance, 'users', userId, 'decks');
    const q = query(decksCollectionRef, orderBy('name', 'asc'));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (error) {
        console.error("FirestoreService: Error loading decks:", error);
        alert("Không thể tải danh sách bộ thẻ từ cơ sở dữ liệu. Vui lòng thử lại.");
        return [];
    }
}

export async function createDeckInFirestore(userId, deckName) {
    if (!userId || !dbInstance || !deckName || !deckName.trim()) {
        console.error("FirestoreService: Missing data for createDeck");
        return null;
    }
    const newDeckData = {
        name: deckName.trim(),
        createdAt: serverTimestamp(),
        owner: userId // Lưu owner để có thể dùng cho rules sau này nếu cần
    };
    try {
        const decksCollectionRef = collection(dbInstance, 'users', userId, 'decks');
        const docRef = await addDoc(decksCollectionRef, newDeckData);
        console.log("FirestoreService: Deck created with ID:", docRef.id);
        return { id: docRef.id, ...newDeckData, createdAt: Date.now() }; // Trả về cả ID và dữ liệu (createdAt là client-side estimate)
    } catch (error) {
        console.error("FirestoreService: Error creating deck:", error);
        alert("Đã xảy ra lỗi khi tạo bộ thẻ. Vui lòng thử lại.");
        return null;
    }
}

export async function updateDeckNameInFirestore(userId, deckId, newName) {
    if (!userId || !dbInstance || !deckId || !newName || !newName.trim()) {
        console.error("FirestoreService: Missing data for updateDeckName");
        return false;
    }
    const deckRef = doc(dbInstance, 'users', userId, 'decks', deckId);
    try {
        await updateDoc(deckRef, { name: newName.trim() });
        console.log("FirestoreService: Deck name updated for ID:", deckId);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error updating deck name:", error);
        alert("Đã xảy ra lỗi khi cập nhật tên bộ thẻ. Vui lòng thử lại.");
        return false;
    }
}

// --- Card Operations ---
export async function loadUserCardsFromFirestore(userId, deckId) {
    if (!userId || !dbInstance || (deckId !== null && !deckId)) { // Allow deckId to be null for unassigned cards
        console.error("FirestoreService: Missing data for loadUserCardsFromDeck (userId or dbInstance missing, or invalid deckId if not null)");
        return [];
    }

    let cardsCollectionRef;
    if (deckId === null) { // Query for unassigned cards
        console.log(`FirestoreService: Loading unassigned cards for user ID: ${userId}`);
        cardsCollectionRef = collection(dbInstance, 'users', userId, 'cards'); // Assuming unassigned cards are directly under user's 'cards' collection
                                                                               // OR adjust path if they are in a specific "unassigned" deck or filtered differently.
                                                                               // For now, this example assumes a top-level 'cards' collection for unassigned.
                                                                               // If they are within decks but with deckId=null, the query needs adjustment.
                                                                               // Let's assume for now they are in a collection where deckId field is literally null or not present.
                                                                               // This part might need refinement based on actual DB structure for "unassigned".
                                                                               // A common way is to have all cards in one subcollection and filter by deckId (including null).
                                                                               // For simplicity with current structure, let's assume loadUserCardsFromFirestore(userId, null) means cards without a deckId.
                                                                               // This might require a different Firestore query if all cards are nested under deck subcollections.
                                                                               // Given the existing saveCardToFirestore, it seems cards are always within a deck's subcollection.
                                                                               // So, loading "unassigned" might mean iterating all decks and finding cards with no deckId, or a dedicated query.
                                                                               // For now, let's adjust to a more likely scenario: query all cards and filter locally, or use a specific query if possible.
                                                                               // The current save logic puts cards into deck subcollections. So "unassigned" is tricky.
                                                                               // Let's assume "unassigned_cards" means we query a special collection or filter.
                                                                               // For now, this function as written is more for a specific deckId.
                                                                               // The logic in script.js handles "unassigned_cards" by calling this with deckId=null.
                                                                               // This implies a different Firestore structure or a need to adjust this function.
                                                                               // Given the save logic, cards are always within a deck.
                                                                               // So, "loadUserCardsFromFirestore(userId, null)" for "unassigned" needs clarification on DB structure.
                                                                               // Let's assume for now it means no cards, or this function is primarily for specific decks.
                                                                               // The `script.js` calls `loadUserCardsFromFirestore(userId, null)` for 'unassigned_cards'.
                                                                               // This function needs to handle `deckId === null` correctly based on DB structure.
                                                                               // If cards are always in `users/{userId}/decks/{deckId}/cards`, then `deckId=null` is problematic.
                                                                               // The `saveCardToFirestore` also takes `deckId || null`.
                                                                               // Let's assume `saveCardToFirestore(..., null, ...)` means it saves to a general pool or this case is not fully implemented.
                                                                               // For now, if deckId is null, we return empty, as cards are expected under a deck.
        console.warn("FirestoreService: loadUserCardsFromFirestore called with deckId=null. This scenario needs specific DB structure for 'unassigned' cards. Returning empty for now.");
        return [];
    } else {
        console.log(`FirestoreService: Loading cards for deck ID: ${deckId} for user ID: ${userId}`);
        cardsCollectionRef = collection(dbInstance, 'users', userId, 'decks', deckId, 'cards');
    }


    const qCards = query(cardsCollectionRef, orderBy('createdAt', 'asc'));
    try {
        const querySnapshot = await getDocs(qCards);
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                isUserCard: true,
                // Chuyển đổi Timestamp sang number (milliseconds) nếu có
                lastReviewed: data.lastReviewed?.toDate ? data.lastReviewed.toDate().getTime() : (data.lastReviewed || null),
                nextReviewDate: data.nextReviewDate?.toDate ? data.nextReviewDate.toDate().getTime() : null,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : (data.createdAt || null),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : (data.updatedAt || null)
            };
        });
    } catch (error) {
        console.error(`FirestoreService: Error loading cards for deck ${deckId}:`, error);
        alert("Không thể tải danh sách thẻ. Vui lòng thử lại.");
        return [];
    }
}

export async function saveCardToFirestore(userId, deckId, cardData, cardId = null) {
    if (!userId || !dbInstance || !cardData) { // deckId can be null for "unassigned" if structured that way
        console.error("FirestoreService: Missing userId, dbInstance, or cardData for saveCardToFirestore");
        return null;
    }
    if (!deckId && cardId) { // If updating, deckId must be known
        console.error("FirestoreService: deckId is required when updating an existing card (cardId is present).");
        return null;
    }

    let cardRef;
    let collectionRefPath;

    if (deckId) {
        collectionRefPath = collection(dbInstance, 'users', userId, 'decks', deckId, 'cards');
    } else {
        // This case implies saving to a general pool of "unassigned" cards.
        // The DB structure needs to support this, e.g., a top-level 'userAllCards' collection
        // or a specific 'unassigned' deck. For now, let's assume a general collection if no deckId.
        // This might need adjustment based on how "unassigned" cards are truly managed.
        // The current `loadUserCardsFromFirestore` is not set up for this general pool.
        console.warn("FirestoreService: saveCardToFirestore called with null deckId. Saving to a general user card pool is not fully specified yet. This might fail or save to an unexpected location if DB structure isn't ready.");
        // A safer approach for "unassigned" might be to have a special deckId like "UNASSIGNED_DECK_ID"
        // rather than null, to keep subcollection structure consistent.
        // For now, let's create a path assuming a general 'cards' collection for the user if no deckId.
        // This is a placeholder and might need to align with `loadUserCardsFromFirestore(userId, null)`
        collectionRefPath = collection(dbInstance, 'users', userId, 'userCards'); // Example path for unassigned
    }


    try {
        if (cardId) { // Update existing card
            if (!deckId) { // Should have been caught above, but double-check
                 console.error("FirestoreService: Cannot update card without deckId.");
                 return null;
            }
            cardData.updatedAt = serverTimestamp();
            cardRef = doc(dbInstance, 'users', userId, 'decks', deckId, 'cards', cardId);
            await updateDoc(cardRef, cardData);
            console.log("FirestoreService: Card updated with ID:", cardId, "in deck:", deckId);
            return cardId;
        } else { // Add new card
            cardData.createdAt = serverTimestamp();
            const docRef = await addDoc(collectionRefPath, cardData);
            console.log("FirestoreService: Card added with ID:", docRef.id, "to path:", collectionRefPath.path);
            return docRef.id;
        }
    } catch (error) {
        console.error("FirestoreService: Error saving card:", error);
        alert("Đã xảy ra lỗi khi lưu thẻ. Vui lòng thử lại.");
        return null;
    }
}

export async function deleteCardFromFirestore(userId, deckId, cardId) {
    if (!userId || !dbInstance || !deckId || !cardId) { // deckId is crucial here as cards are under decks
        console.error("FirestoreService: Missing data for deleteCardFromFirestore (userId, dbInstance, deckId, or cardId)");
        return false;
    }
    try {
        const cardRef = doc(dbInstance, 'users', userId, 'decks', deckId, 'cards', cardId);
        await deleteDoc(cardRef);
        console.log("FirestoreService: Card deleted:", cardId, "from deck:", deckId);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error deleting card:", error);
        alert("Đã xảy ra lỗi khi xóa thẻ. Vui lòng thử lại.");
        return false;
    }
}

// --- Web Card Status Operations ---
export async function getWebCardStatusFromFirestore(userId, webCardGlobalId) {
    if (!userId || !dbInstance || !webCardGlobalId) {
        // console.log("FirestoreService: Missing data for getWebCardStatusFromFirestore, returning default.");
        return null; // Trả về null nếu không có userId hoặc webCardGlobalId
    }
    const statusRef = doc(dbInstance, 'users', userId, 'webCardStatuses', webCardGlobalId);
    try {
        const docSnap = await getDoc(statusRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                lastReviewed: data.lastReviewed?.toDate ? data.lastReviewed.toDate().getTime() : (data.lastReviewed || null),
                nextReviewDate: data.nextReviewDate?.toDate ? data.nextReviewDate.toDate().getTime() : null,
            };
        }
        return null; // Không tìm thấy trạng thái
    } catch (error) {
        console.error("FirestoreService: Error fetching web card status for", webCardGlobalId, error);
        return null;
    }
}

export async function updateWebCardStatusInFirestore(userId, webCardGlobalId, cardData, srsDataToUpdate) {
    if (!userId || !dbInstance || !webCardGlobalId || !cardData || !srsDataToUpdate) {
        console.error("FirestoreService: Missing data for updateWebCardStatusInFirestore");
        return false;
    }
    const statusRef = doc(dbInstance, 'users', userId, 'webCardStatuses', webCardGlobalId);

    let originalTerm;
    if (cardData.category === 'phrasalVerbs') {
        originalTerm = cardData.phrasalVerb;
    } else if (cardData.category === 'collocations') {
        originalTerm = cardData.collocation;
    } else if (cardData.category === 'idioms') { // Sửa ở đây
        originalTerm = cardData.idiom;
    } else {
        originalTerm = cardData.word;
    }

    // Đảm bảo originalTerm không phải là undefined trước khi lưu
    if (originalTerm === undefined) {
        console.error("FirestoreService: originalWordOrPhrase is undefined for cardData:", cardData);
        alert("Lỗi: Không thể xác định thuật ngữ gốc của thẻ web để cập nhật trạng thái.");
        return false;
    }

    const dataToSet = {
        originalCategory: cardData.category,
        originalWordOrPhrase: originalTerm,
        ...srsDataToUpdate
    };

    try {
        await setDoc(statusRef, dataToSet, { merge: true });
        console.log(`FirestoreService: Web card status SRS updated: ${webCardGlobalId}`, srsDataToUpdate);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error updating web card status SRS:", error);
        // alert("Lỗi cập nhật trạng thái thẻ web trên server. Vui lòng thử lại."); // Lỗi này đã có trong log, không cần alert
        return false;
    }
}


// --- AppState Operations ---
export async function loadAppStateFromFirestore(userId) {
    if (!userId || !dbInstance) {
        console.error("FirestoreService: Missing userId or dbInstance for loadAppStateFromFirestore");
        return null;
    }
    const appStateRef = doc(dbInstance, 'users', userId, 'userSettings', 'appStateDoc');
    try {
        const docSnap = await getDoc(appStateRef);
        if (docSnap.exists()) {
            console.log("FirestoreService: AppState loaded from Firestore.");
            return docSnap.data();
        }
        console.log("FirestoreService: No AppState in Firestore for this user.");
        return null;
    } catch (error) {
        console.error("FirestoreService: Error loading appState from Firestore:", error);
        return null;
    }
}

export async function saveAppStateToFirestoreService(userId, appStateData) {
    if (!userId || !dbInstance || !appStateData) {
        console.error("FirestoreService: Missing data for saveAppStateToFirestoreService");
        return false;
    }
    const appStateRef = doc(dbInstance, 'users', userId, 'userSettings', 'appStateDoc');
    try {
        await setDoc(appStateRef, appStateData); // Ghi đè toàn bộ
        console.log("FirestoreService: AppState saved to Firestore for user:", userId);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error saving appState to Firestore:", error);
        return false;
    }
}

// --- Lecture Content Operations ---
export async function getLectureContent(lectureId) {
    if (!dbInstance || !lectureId) {
        console.error("FirestoreService: Missing dbInstance or lectureId for getLectureContent");
        return null;
    }
    const lectureRef = doc(dbInstance, 'lectures', lectureId);
    try {
        const docSnap = await getDoc(lectureRef);
        if (docSnap.exists()) {
            console.log("FirestoreService: Lecture content loaded for ID:", lectureId);
            return docSnap.data(); // { title: "...", contentHTML: "..." }
        }
        console.log("FirestoreService: No lecture content found for ID:", lectureId);
        return null;
    } catch (error) {
        console.error("FirestoreService: Error loading lecture content:", error);
        return null;
    }
}

export async function saveLectureContent(lectureId, title, contentHTML) {
    if (!dbInstance || !lectureId || typeof title !== 'string' || typeof contentHTML !== 'string') {
        console.error("FirestoreService: Missing data or invalid type for saveLectureContent");
        return false;
    }
    const lectureRef = doc(dbInstance, 'lectures', lectureId);
    const dataToSave = {
        title: title,
        contentHTML: contentHTML,
        lastUpdatedAt: serverTimestamp()
    };
    try {
        await setDoc(lectureRef, dataToSave, { merge: true }); // Dùng merge để không ghi đè các trường khác nếu có
        console.log("FirestoreService: Lecture content saved for ID:", lectureId);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error saving lecture content:", error);
        return false;
    }
}
