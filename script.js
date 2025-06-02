<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ứng dụng Flashcard</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col min-h-screen">

    <header class="bg-white dark:bg-slate-800 shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
        <div class="flex items-center">
            <button id="hamburger-menu-btn" class="p-2 mr-3 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <i class="fas fa-bars text-xl"></i>
            </button>
            <h1 id="main-header-title" class="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-white">Ứng dụng Flashcard</h1>
        </div>
        <div class="flex items-center space-x-2 sm:space-x-4">
            <span id="user-email-display" class="hidden text-sm font-medium text-slate-600 dark:text-slate-300"></span>
            <button id="auth-action-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-md shadow-md transition-colors duration-200 text-sm flex items-center">
                <i class="fas fa-sign-in-alt"></i><span class="hidden sm:inline ml-1 sm:ml-2">Đăng nhập</span>
            </button>
        </div>
    </header>

    <main class="flex-grow p-4 flex flex-col items-center justify-center relative">

        <div class="flashcard-container w-full max-w-md h-[400px] sm:h-[450px] relative mb-4">
            <div id="flashcard" class="flashcard absolute w-full h-full rounded-lg shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col">
                <div class="card-front absolute w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <div class="flex-grow flex flex-col items-center justify-center w-full">
                        <p id="word-display" class="text-3xl sm:text-4xl font-bold break-words px-4">Đang tải...</p>
                        <p id="pronunciation-display" class="text-lg sm:text-xl font-medium opacity-80 mt-2 px-4"></p>
                        <p id="tags-display-front" class="text-sm sm:text-base opacity-70 mt-2 px-4"></p>
                    </div>
                    <button id="flip-icon-front" class="absolute bottom-4 right-4 text-white opacity-80 hover:opacity-100 transition-opacity">
                        <i class="fas fa-redo text-2xl"></i>
                    </button>
                </div>

                <div class="card-back absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-6 flex flex-col overflow-hidden">
                    <div class="card-scrollable-content flex-grow overflow-y-auto custom-scrollbar pr-2">
                        <div id="meaning-display-container" class="mb-4">
                            </div>
                        <div id="notes-section" class="mt-4 pt-3 border-t border-purple-400 border-opacity-50" style="display: none;">
                            <h3 class="text-sm font-semibold mb-2 text-purple-200">Ghi chú chung:</h3>
                            <p id="notes-display" class="text-sm text-purple-100"></p>
                        </div>
                    </div>
                    <div class="flex-shrink-0 mt-4 flex justify-between items-center">
                        <button id="flip-icon-back" class="text-white opacity-80 hover:opacity-100 transition-opacity">
                            <i class="fas fa-redo text-2xl"></i>
                        </button>
                        <div class="flex space-x-2">
                            <button id="card-options-menu-btn-back" class="card-action-btn-on-back bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1.5 rounded-md flex items-center shadow-md">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-center space-x-3 w-full max-w-md">
            <button id="prev-btn" class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Thẻ trước">
                <i class="fas fa-arrow-left text-xl"></i>
            </button>
            <button id="flip-btn" class="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg transition-colors duration-200 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                Lật thẻ
            </button>
            <button id="next-btn" class="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" title="Thẻ tiếp theo">
                <i class="fas fa-arrow-right text-xl"></i>
            </button>
        </div>

        <div class="flex items-center justify-center mt-4 text-slate-600 dark:text-slate-300">
            <span id="current-card-index">0</span> / <span id="total-cards">0</span>
        </div>

        <div class="flex justify-center space-x-3 mt-6 w-full max-w-md">
            <button id="speaker-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-md transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                <i class="fas fa-volume-up mr-2"></i> Phát âm
            </button>
            <button id="speaker-example-btn" class="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-md shadow-md transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm" style="display: none;">
                <i class="fas fa-volume-up mr-2"></i> Phát âm ví dụ
            </button>
            <button id="card-options-menu-btn" class="bg-slate-300 hover:bg-slate-400 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white px-4 py-2 rounded-md shadow-md transition-colors duration-200 flex items-center text-sm">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>

        <div class="grid grid-cols-3 gap-3 mt-6 w-full max-w-md">
            <button id="action-btn-notes" class="additional-action-btn bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800">
                <i class="fas fa-book"></i>
                <span>Bài giảng</span>
            </button>
            <button id="action-btn-media" class="additional-action-btn bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-800">
                <i class="fas fa-video"></i>
                <span>Media</span>
            </button>
            <button id="action-btn-practice-card" class="additional-action-btn bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-800">
                <i class="fas fa-pencil-alt"></i>
                <span>Bài tập</span>
            </button>
        </div>

    </main>

    <div id="filter-sidebar" class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 shadow-lg p-4 z-50 transform -translate-x-full overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-slate-800 dark:text-white">Bộ lọc</h2>
            <button id="close-sidebar-btn" class="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>

        <div id="user-deck-filter-container" class="mb-4">
            <label for="user-deck-select" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bộ thẻ:</label>
            <select id="user-deck-select" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                <option value="all_user_cards">Tất cả thẻ của tôi</option>
                <option value="unassigned_cards">Thẻ chưa có bộ</option>
            </select>
        </div>

        <button id="manage-decks-btn" class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm mb-4">
            <i class="fas fa-layer-group mr-2"></i> Quản lý Bộ thẻ
        </button>

        <button id="open-add-card-modal-btn" class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm mb-4">
            <i class="fas fa-plus-circle mr-2"></i> Thêm thẻ mới
        </button>

        <div class="mb-4">
            <label for="category" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Danh mục:</label>
            <select id="category" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                <option value="phrasalVerbs">Cụm động từ</option>
                <option value="collocations">Kết hợp từ</option>
                <option value="idioms">Thành ngữ</option>
                <option value="nouns">Danh từ</option>
                <option value="verbs">Động từ</option>
                <option value="adjectives">Tính từ</option>
            </select>
        </div>

        <div id="base-verb-filter-container" class="mb-4">
            <label for="base-verb-filter" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Từ gốc:</label>
            <select id="base-verb-filter" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                <option value="all">Tất cả từ gốc</option>
            </select>
        </div>

        <div id="tag-filter-container" class="mb-4">
            <label for="tags" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Chủ đề (Tags):</label>
            <select id="tags" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                <option value="all">Tất cả chủ đề</option>
            </select>
        </div>

        <div class="mb-4">
            <label for="filter-card-status" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Trạng thái thẻ:</label>
            <select id="filter-card-status" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                <option value="all_cards">Tất cả thẻ</option>
                <option value="learned">Đã học</option>
            </select>
        </div>

        <div class="mb-4 relative">
            <label for="search-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tìm kiếm:</label>
            <input type="text" id="search-input" placeholder="Tìm kiếm từ, nghĩa, ví dụ..." class="w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
        </div>

        <div class="mb-4 border-t pt-4 border-slate-200 dark:border-slate-700">
            <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Thẻ xem gần đây</h3>
            <ul id="recently-viewed-list" class="space-y-2">
                </ul>
            <p id="no-recent-cards-message" class="text-slate-500 italic text-sm mt-2" style="display: none;">Chưa có thẻ nào được xem gần đây.</p>
        </div>
    </div>

    <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden"></div>

    <div id="add-edit-card-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] hidden opacity-0">
        <div class="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-11/12 max-w-2xl transform scale-95 transition-transform duration-250 ease-out max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 id="modal-title" class="text-xl font-semibold text-slate-800 dark:text-white">Thêm thẻ mới</h3>
                <button id="close-modal-btn" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none">×</button>
            </div>

            <div class="flex mb-4 flex-shrink-0">
                <button id="manual-input-mode-btn" class="input-mode-toggle-btn active mr-2">Nhập thủ công</button>
                <button id="json-input-mode-btn" class="input-mode-toggle-btn">Nhập từ JSON</button>
            </div>

            <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <form id="add-edit-card-form" class="space-y-4">
                    <input type="hidden" id="card-id-input">

                    <div id="modal-deck-assignment-container" class="mb-4">
                        <label for="card-deck-assignment-select" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Gán vào bộ thẻ:</label>
                        <select id="card-deck-assignment-select" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                            <option value="">-- Chọn bộ thẻ --</option>
                        </select>
                        <p id="deck-creation-hint" class="text-sm text-yellow-600 dark:text-yellow-400 mt-2 hidden"></p>
                    </div>

                    <div class="relative">
                        <label for="card-word-input" id="card-word-label" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Từ (Tiếng Anh) <span class="text-red-500">*</span></label>
                        <input type="text" id="card-word-input" class="block w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="Ví dụ: run, look up, kick the bucket..." required>
                        <p id="card-word-error" class="form-error-message hidden"></p>
                    </div>

                    <div class="relative">
                        <label for="card-pronunciation-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phiên âm (tùy chọn):</label>
                        <input type="text" id="card-pronunciation-input" class="block w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="/rʌn/, /lʊk ʌp/...">
                    </div>

                    <div id="phrasal-verb-specific-fields" class="space-y-4">
                        <div class="relative">
                            <label for="card-base-verb-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Từ gốc (cho Cụm động từ/Kết hợp từ - tùy chọn):</label>
                            <input type="text" id="card-base-verb-input" class="block w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="Ví dụ: look, take...">
                        </div>
                        <div class="relative">
                            <label for="card-tags-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Chủ đề (Tags - tùy chọn, cách nhau bởi dấu phẩy):</label>
                            <input type="text" id="card-tags-input" class="block w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="Ví dụ: communication, daily_routine...">
                        </div>
                    </div>

                    <div>
                        <h4 class="text-base font-medium text-slate-700 dark:text-slate-200 mb-2">Nghĩa của từ/cụm từ:</h4>
                        <p id="meaning-blocks-general-error" class="form-error-message hidden mb-2"></p>
                        <div id="meaning-blocks-container" class="space-y-4">
                            </div>
                        <button type="button" id="add-another-meaning-block-at-end-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm mt-4">
                            <i class="fas fa-plus mr-2"></i> Thêm nghĩa khác
                        </button>
                    </div>

                    <div class="relative">
                        <label for="card-general-notes-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Ghi chú chung (tùy chọn):</label>
                        <textarea id="card-general-notes-input" rows="3" class="block w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="Bất kỳ ghi chú bổ sung nào về thẻ..."></textarea>
                    </div>
                    <div class="relative">
                        <label for="card-video-url-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Link video YouTube (tùy chọn):</label>
                        <input type="url" id="card-video-url-input" class="block w-full p-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="https://www.youtube.com/watch?v=...">
                    </div>
                </form>

                <div id="json-input-area" class="space-y-4 hidden">
                    <div id="json-deck-assignment-container" class="mb-4">
                        <label for="json-card-deck-assignment-select" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Gán vào bộ thẻ:</label>
                        <select id="json-card-deck-assignment-select" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white">
                            <option value="">-- Chọn bộ thẻ --</option>
                        </select>
                        <p id="json-deck-creation-hint" class="text-sm text-yellow-600 dark:text-yellow-400 mt-2 hidden"></p>
                    </div>
                    <label for="card-json-input" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Dán JSON của thẻ vào đây:</label>
                    <textarea id="card-json-input" rows="10" class="block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder='[{"word": "example", "pronunciation": "/ɪɡˈzæmpəl/", "meanings": [{"text": "ví dụ", "examples": [{"eng": "This is an example.", "vie": "Đây là một ví dụ."}]}], "category": "nouns"}]'></textarea>
                    <p id="json-import-error-message" class="form-error-message hidden"></p>
                    <p id="json-import-success-message" class="text-green-600 text-sm mt-2 hidden"></p>
                </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <button type="button" id="cancel-card-btn" class="bg-slate-300 hover:bg-slate-400 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white font-semibold py-2 px-4 rounded-md shadow-sm">Hủy</button>
                <button type="submit" id="save-card-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm">Lưu thẻ</button>
                <button type="button" id="process-json-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hidden">Xử lý JSON & Tạo Thẻ</button>
            </div>
        </div>
    </div>

    <div id="manage-decks-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] hidden opacity-0">
        <div class="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-11/12 max-w-xl transform scale-95 transition-transform duration-250 ease-out max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 class="text-xl font-semibold text-slate-800 dark:text-white">Quản lý Bộ thẻ của tôi</h3>
                <button id="close-deck-modal-btn" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none">×</button>
            </div>

            <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div class="mb-6">
                    <h4 class="text-lg font-medium text-slate-700 dark:text-slate-200 mb-3">Tạo bộ thẻ mới</h4>
                    <div class="flex space-x-2">
                        <input type="text" id="new-deck-name-input" placeholder="Tên bộ thẻ mới" class="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white">
                        <button id="add-new-deck-btn" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm">Thêm</button>
                    </div>
                </div>

                <div>
                    <h4 class="text-lg font-medium text-slate-700 dark:text-slate-200 mb-3">Các bộ thẻ hiện có</h4>
                    <div id="existing-decks-list" class="space-y-3">
                        </div>
                </div>
            </div>
        </div>
    </div>

    <div id="bottom-sheet-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-[1000] hidden opacity-0 transition-opacity duration-300"></div>
    <div id="bottom-sheet" class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-lg shadow-xl z-[1010] transform translate-y-full transition-transform duration-300 flex flex-col h-1/2 max-h-[80vh]">
        <div class="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h3 id="bottom-sheet-title" class="text-xl font-semibold text-slate-800 dark:text-white">Chi tiết</h3>
            <button id="close-bottom-sheet-btn" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none">×</button>
        </div>
        <div id="bottom-sheet-tabs" class="flex flex-shrink-0">
            <button id="tab-btn-youtube" class="bottom-sheet-tab-btn active">YouTube</button>
        </div>
        <div id="bottom-sheet-content" class="flex-grow overflow-y-auto p-4 custom-scrollbar">
            </div>
    </div>

    <div id="general-feedback-toast" class="fixed bottom-5 right-5 text-white text-sm py-3 px-5 rounded-lg shadow-md opacity-0 transition-opacity duration-500 ease-in-out z-[1010]"></div>

    <script type="module" src="script.js"></script>
</body>
</html>
