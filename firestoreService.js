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
        // alert("Không thể tải danh sách bộ thẻ từ cơ sở dữ liệu. Vui lòng thử lại."); // User-facing alerts should be in main script
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
        owner: userId 
    };
    try {
        const decksCollectionRef = collection(dbInstance, 'users', userId, 'decks');
        const docRef = await addDoc(decksCollectionRef, newDeckData);
        console.log("FirestoreService: Deck created with ID:", docRef.id);
        return { id: docRef.id, ...newDeckData, createdAt: Date.now() }; 
    } catch (error) {
        console.error("FirestoreService: Error creating deck:", error);
        // alert("Đã xảy ra lỗi khi tạo bộ thẻ. Vui lòng thử lại.");
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
        // alert("Đã xảy ra lỗi khi cập nhật tên bộ thẻ. Vui lòng thử lại.");
        return false;
    }
}

// --- Card Operations ---
export async function loadUserCardsFromFirestore(userId, deckId) {
    if (!userId || !dbInstance) { 
        console.error("FirestoreService: Missing userId or dbInstance for loadUserCardsFromFirestore");
        return [];
    }
    
    let cardsCollectionRef;
    if (deckId) {
        console.log(`FirestoreService: Loading cards for deck ID: ${deckId} for user ID: ${userId}`);
        cardsCollectionRef = collection(dbInstance, 'users', userId, 'decks', deckId, 'cards');
    } else {
        console.log(`FirestoreService: deckId is null for user ID: ${userId}. No cards loaded for 'unassigned' state via this path currently.`);
        return []; 
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
                lastReviewed: data.lastReviewed?.toDate ? data.lastReviewed.toDate().getTime() : (data.lastReviewed || null),
                nextReviewDate: data.nextReviewDate?.toDate ? data.nextReviewDate.toDate().getTime() : null,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : (data.createdAt || null),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : (data.updatedAt || null)
            };
        });
    } catch (error) {
        console.error(`FirestoreService: Error loading cards for deck ${deckId}:`, error);
        // alert("Không thể tải danh sách thẻ. Vui lòng thử lại.");
        return [];
    }
}

export async function saveCardToFirestore(userId, deckId, cardData, cardId = null) {
    if (!userId || !dbInstance || !cardData ) { 
        console.error("FirestoreService: Missing data for saveCardToFirestore (userId, dbInstance, or cardData)");
        return null;
    }
    if (cardData.isUserCard && !deckId && cardId) { 
         console.log("FirestoreService: Updating unassigned user card.");
    } else if (!deckId && cardData.isUserCard && !cardId) { // Thêm mới thẻ user mà không có deckId
         console.warn("FirestoreService: Adding new user card without a deckId. This card will be 'unassigned'. Consider specific handling.");
         // Để cho phép lưu thẻ chưa gán, bạn có thể không báo lỗi ở đây, 
         // nhưng logic loadUserCards cần có cách để tải các thẻ này (ví dụ: một query riêng hoặc một collection 'unassignedCards')
         // Hiện tại, nếu không có deckId, collectionPath sẽ không được xác định đúng cho thẻ mới.
         // Để an toàn, chúng ta sẽ không cho phép tạo mới nếu không có deckId.
         alert("Vui lòng chọn một bộ thẻ để lưu thẻ mới, hoặc đảm bảo logic cho thẻ chưa gán đã được thiết lập.");
         return null;
    }
    
    let collectionPath;
    if (deckId) {
        collectionPath = `users/${userId}/decks/${deckId}/cards`;
    } else if (cardId && cardData.isUserCard) { 
        // Đây là trường hợp update thẻ chưa gán, bạn cần định nghĩa collectionPath cho nó
        // Ví dụ: collectionPath = `users/${userId}/unassignedCards`;
        // Nếu không có logic này, việc update sẽ thất bại.
        console.error("FirestoreService: Attempting to update a card with null deckId. Define path for unassigned cards.");
        return null;
    } else {
        console.error("FirestoreService: Invalid path for saving card. DeckId is null for a new card or non-user card.");
        return null;
    }

    try {
        const cardsCollectionRef = collection(dbInstance, collectionPath);
        if (cardId) { 
            cardData.updatedAt = serverTimestamp();
            const cardRef = doc(cardsCollectionRef, cardId);
            await updateDoc(cardRef, cardData);
            console.log("FirestoreService: Card updated with ID:", cardId);
            return cardId;
        } else { 
            cardData.createdAt = serverTimestamp();
            cardData.updatedAt = serverTimestamp(); 
            const docRef = await addDoc(cardsCollectionRef, cardData);
            console.log("FirestoreService: Card added with ID:", docRef.id);
            return docRef.id;
        }
    } catch (error) {
        console.error("FirestoreService: Error saving card:", error);
        // alert("Đã xảy ra lỗi khi lưu thẻ. Vui lòng thử lại.");
        return null;
    }
}

export async function deleteCardFromFirestore(userId, deckId, cardId) {
     if (!userId || !dbInstance || !cardId) { 
        console.error("FirestoreService: Missing data for deleteCardFromFirestore");
        return false;
    }
    try {
        let cardRef;
        if (deckId) {
            cardRef = doc(dbInstance, 'users', userId, 'decks', deckId, 'cards', cardId);
        } else {
            // Logic để xóa thẻ chưa gán
            console.error("FirestoreService: Cannot delete card, deckId is null and no logic for unassigned cards deletion.");
            return false;
        }
        await deleteDoc(cardRef);
        console.log("FirestoreService: Card deleted:", cardId);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error deleting card:", error);
        // alert("Đã xảy ra lỗi khi xóa thẻ. Vui lòng thử lại.");
        return false;
    }
}

// --- Web Card Status Operations ---
export async function getWebCardStatusFromFirestore(userId, webCardGlobalId) {
    if (!userId || !dbInstance || !webCardGlobalId) {
        return null; 
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
        return null; 
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
    const dataToSet = {
        originalCategory: cardData.category,
        originalWordOrPhrase: cardData.category === 'phrasalVerbs' ? cardData.phrasalVerb : (cardData.category === 'collocations' ? cardData.collocation : cardData.word),
        ...srsDataToUpdate 
    };
    try {
        await setDoc(statusRef, dataToSet, { merge: true });
        console.log(`FirestoreService: Web card status SRS updated: ${webCardGlobalId}`, srsDataToUpdate);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error updating web card status SRS:", error);
        // alert("Lỗi cập nhật trạng thái thẻ web trên server. Vui lòng thử lại.");
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
        await setDoc(appStateRef, appStateData); 
        console.log("FirestoreService: AppState saved to Firestore for user:", userId);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error saving appState to Firestore:", error);
        return false;
    }
}

// --- Lecture Operations ---
export async function getLectureContent(cardIdentifier) {
    if (!dbInstance || !cardIdentifier) {
        console.error("FirestoreService: Missing dbInstance or cardIdentifier for getLectureContent");
        return null;
    }
    const lectureRef = doc(dbInstance, 'lectures', cardIdentifier);
    try {
        const docSnap = await getDoc(lectureRef);
        if (docSnap.exists()) {
            console.log("FirestoreService: Lecture content found for", cardIdentifier);
            return docSnap.data();
        } else {
            console.log("FirestoreService: No lecture content found for", cardIdentifier);
            return null;
        }
    } catch (error) {
        console.error("FirestoreService: Error fetching lecture content for", cardIdentifier, error);
        // alert("Không thể tải nội dung bài giảng. Vui lòng thử lại."); // Nên xử lý ở client
        return null;
    }
}

export async function saveLectureContent(cardIdentifier, title, contentHTML) {
    if (!dbInstance || !cardIdentifier || typeof title !== 'string' || typeof contentHTML !== 'string') {
        console.error("FirestoreService: Missing or invalid data for saveLectureContent");
        return false;
    }
    const lectureRef = doc(dbInstance, 'lectures', cardIdentifier);
    const lectureData = {
        title: title,
        contentHTML: contentHTML,
        lastUpdated: serverTimestamp()
    };
    try {
        await setDoc(lectureRef, lectureData, { merge: true }); // merge: true để tạo mới hoặc cập nhật
        console.log("FirestoreService: Lecture content saved for", cardIdentifier);
        return true;
    } catch (error) {
        console.error("FirestoreService: Error saving lecture content for", cardIdentifier, error);
        // alert("Không thể lưu bài giảng. Vui lòng thử lại."); // Nên xử lý ở client
        return false;
    }
}
