import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Bell, Moon, Settings, AlertTriangle, Edit2, Quote, Heart,
    MapPin, Search, X, Plus, Sparkles, User, Trash2, BookOpen,
    FileText, Users, ChevronDown, MessageSquare, Check
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import Layout from '../components/Layout';
import '../styles/library.css';

const API = 'http://localhost:5000/api/library';

// ─── Character Tooltip Component ────────────────────────────────────────
const CharacterTooltip = ({ character, position }) => {
    if (!character) return null;
    const roleColors = {
        'Protagonist': '#3B82F6',
        'Antagonist': '#EF4444',
        'Supporting': '#8B5CF6',
        'Love Interest': '#EC4899',
        'Mentor': '#F59E0B',
        'Unknown': '#64748B'
    };
    return (
        <div className="character-tooltip" style={{ top: position.top, left: position.left }}>
            <div className="tooltip-header">
                <div className="tooltip-avatar">
                    <User size={20} />
                </div>
                <div>
                    <h4 className="tooltip-name">{character.name}</h4>
                    <span className="tooltip-role" style={{ background: roleColors[character.role] || '#64748B' }}>
                        {character.role || 'Unknown'}
                    </span>
                </div>
            </div>
            {character.description && (
                <p className="tooltip-description">{character.description}</p>
            )}
        </div>
    );
};

// ─── Note Renderer with @mention highlights ─────────────────────────────
const NoteContent = ({ content, characters }) => {
    const [tooltip, setTooltip] = useState(null);
    const timeoutRef = useRef(null);

    const renderContent = () => {
        const parts = content.split(/(@\w[\w\s]*?)(?=\s@|\s[^@]|$)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                const charName = part.slice(1).trim();
                const character = characters.find(
                    c => c.name.toLowerCase() === charName.toLowerCase()
                );
                if (character) {
                    return (
                        <span
                            key={i}
                            className="mention-highlight"
                            onMouseEnter={(e) => {
                                clearTimeout(timeoutRef.current);
                                const rect = e.target.getBoundingClientRect();
                                setTooltip({
                                    character,
                                    position: { top: rect.bottom + 8, left: rect.left }
                                });
                            }}
                            onMouseLeave={() => {
                                timeoutRef.current = setTimeout(() => setTooltip(null), 200);
                            }}
                        >
                            @{character.name}
                        </span>
                    );
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="note-content-rendered">
            {renderContent()}
            {tooltip && (
                <CharacterTooltip
                    character={tooltip.character}
                    position={tooltip.position}
                />
            )}
        </div>
    );
};

// ─── Mention Dropdown for Note Editor ────────────────────────────────────
const MentionDropdown = ({ characters, filter, onSelect, position }) => {
    const filtered = characters.filter(c =>
        c.name.toLowerCase().includes(filter.toLowerCase())
    );
    if (filtered.length === 0) return null;

    return (
        <div className="mention-dropdown" style={{ top: position.top, left: position.left }}>
            {filtered.map(c => (
                <div
                    key={c._id}
                    className="mention-option"
                    onClick={() => onSelect(c)}
                >
                    <User size={14} />
                    <span>{c.name}</span>
                    <span className="mention-option-role">{c.role}</span>
                </div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════
const shelfContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const bookItem = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
const BookLibrary = () => {
    const { token } = useContext(AuthContext);
    const [library, setLibrary] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // UI States
    const [isSearching, setIsSearching] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [activeTab, setActiveTab] = useState('progress');
    const [tbrFilter, setTbrFilter] = useState('Ours');

    // Character states
    const [showAddChar, setShowAddChar] = useState(false);
    const [newChar, setNewChar] = useState({ name: '', role: 'Supporting', description: '' });
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [editingChar, setEditingChar] = useState(null);

    // Note states
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNote, setNewNote] = useState({ content: '', page: '', type: 'note' });
    const [mentionState, setMentionState] = useState({ active: false, filter: '', position: {} });
    const noteInputRef = useRef(null);

    const config = { headers: { 'Content-Type': 'application/json', 'x-auth-token': token } };

    // ─── Fetch Library ───
    useEffect(() => {
        const fetchLibrary = async () => {
            if (!token) return;
            try {
                const res = await axios.get(API, config);
                setLibrary(res.data);
            } catch (err) {
                console.error("Error fetching library:", err);
            }
        };
        fetchLibrary();
    }, [token]);

    // ─── Search Google Books ───
    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        try {
            const res = await axios.get(`${API}/search?q=${searchQuery}`, config);
            setSearchResults(res.data.items || []);
        } catch (err) {
            console.error("Error searching books:", err);
        }
    };

    const closeSearch = () => {
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const addToLibrary = async (googleBook, status = 'TBR') => {
        const volumeInfo = googleBook.volumeInfo;
        const newBook = {
            googleBookId: googleBook.id,
            title: volumeInfo.title,
            authors: volumeInfo.authors || ['Unknown'],
            thumbnail: volumeInfo.imageLinks?.thumbnail ? volumeInfo.imageLinks.thumbnail.replace('http:', 'https:') : '',
            pageCount: volumeInfo.pageCount || 0,
            description: volumeInfo.description || '',
            status
        };
        try {
            await axios.post(API, newBook, config);
            const res = await axios.get(API, config);
            setLibrary(res.data);
            closeSearch();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error adding book');
        }
    };

    const updateProgress = async (book, newPage, newTotal = null) => {
        try {
            let status = book.status;
            const total = newTotal || book.pageCount;
            if (newPage >= total && total > 0) status = 'Finished';
            const payload = { currentPage: newPage, status };
            if (newTotal) payload.pageCount = newTotal;
            await axios.put(`${API}/${book._id}/progress`, payload, config);
            setLibrary(prev => prev.map(b => b._id === book._id ? { ...b, currentPage: newPage, pageCount: total, status } : b));
            if (selectedBook && selectedBook._id === book._id) {
                setSelectedBook(prev => ({ ...prev, currentPage: newPage, pageCount: total, status }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Character CRUD ───
    const addCharacter = async () => {
        if (!newChar.name.trim()) return;
        try {
            const res = await axios.post(`${API}/${selectedBook._id}/content`, {
                type: 'character', data: newChar
            }, config);
            setSelectedBook(res.data);
            setLibrary(prev => prev.map(b => b._id === res.data._id ? res.data : b));
            setNewChar({ name: '', role: 'Supporting', description: '' });
            setShowAddChar(false);
        } catch (err) {
            console.error(err);
        }
    };

    const addCharacterFromSuggestion = async (suggestion) => {
        try {
            const res = await axios.post(`${API}/${selectedBook._id}/content`, {
                type: 'character', data: suggestion
            }, config);
            setSelectedBook(res.data);
            setLibrary(prev => prev.map(b => b._id === res.data._id ? res.data : b));
            setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCharacter = async (charId) => {
        try {
            const res = await axios.delete(`${API}/${selectedBook._id}/content/${charId}?contentType=character`, config);
            setSelectedBook(res.data);
            setLibrary(prev => prev.map(b => b._id === res.data._id ? res.data : b));
        } catch (err) {
            console.error(err);
        }
    };

    const updateCharacter = async (charId, updates) => {
        try {
            const res = await axios.put(`${API}/${selectedBook._id}/content/${charId}`, updates, config);
            setSelectedBook(res.data);
            setLibrary(prev => prev.map(b => b._id === res.data._id ? res.data : b));
            setEditingChar(null);
        } catch (err) {
            console.error(err);
        }
    };

    const suggestCharacters = async () => {
        setIsSuggesting(true);
        try {
            const res = await axios.get(`${API}/${selectedBook._id}/characters/suggest`, config);
            setSuggestions(res.data.suggestions || []);
        } catch (err) {
            console.error(err);
        }
        setIsSuggesting(false);
    };

    // ─── Notes CRUD ───
    const addNote = async () => {
        if (!newNote.content.trim()) return;
        const mentionPattern = /@(\w[\w\s]*?)(?=\s@|\s[^@]|$)/g;
        const mentions = [];
        let match;
        while ((match = mentionPattern.exec(newNote.content)) !== null) {
            mentions.push(match[1].trim());
        }
        try {
            const res = await axios.post(`${API}/${selectedBook._id}/content`, {
                type: 'note', data: { ...newNote, page: newNote.page ? parseInt(newNote.page) : undefined, mentions }
            }, config);
            setSelectedBook(res.data);
            setLibrary(prev => prev.map(b => b._id === res.data._id ? res.data : b));
            setNewNote({ content: '', page: '', type: 'note' });
            setShowAddNote(false);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNote = async (noteId) => {
        try {
            const res = await axios.delete(`${API}/${selectedBook._id}/content/${noteId}?contentType=note`, config);
            setSelectedBook(res.data);
            setLibrary(prev => prev.map(b => b._id === res.data._id ? res.data : b));
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Mention handling in textarea ───
    const handleNoteInput = (e) => {
        const value = e.target.value;
        setNewNote(prev => ({ ...prev, content: value }));

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastAtSign = textBeforeCursor.lastIndexOf('@');

        if (lastAtSign !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtSign + 1);
            if (!textAfterAt.includes('\n') && textAfterAt.length < 30) {
                const rect = e.target.getBoundingClientRect();
                setMentionState({
                    active: true,
                    filter: textAfterAt,
                    position: { top: rect.bottom + 4, left: rect.left + 20 }
                });
                return;
            }
        }
        setMentionState({ active: false, filter: '', position: {} });
    };

    const insertMention = (character) => {
        const content = newNote.content;
        const cursorPos = noteInputRef.current?.selectionStart || content.length;
        const textBeforeCursor = content.slice(0, cursorPos);
        const lastAtSign = textBeforeCursor.lastIndexOf('@');
        const before = content.slice(0, lastAtSign);
        const after = content.slice(cursorPos);
        const newContent = `${before}@${character.name} ${after}`;
        setNewNote(prev => ({ ...prev, content: newContent }));
        setMentionState({ active: false, filter: '', position: {} });
        noteInputRef.current?.focus();
    };

    const getPercent = (current, total) => {
        if (!total || total === 0) return 0;
        return Math.round((current / total) * 100) || 0;
    };

    const roleOptions = ['Protagonist', 'Antagonist', 'Supporting', 'Love Interest', 'Mentor', 'Unknown'];
    const roleColors = {
        'Protagonist': '#3B82F6',
        'Antagonist': '#EF4444',
        'Supporting': '#8B5CF6',
        'Love Interest': '#EC4899',
        'Mentor': '#F59E0B',
        'Unknown': '#64748B'
    };

    // Data helpers
    const readingBooks = library.filter(b => b.status === 'Reading');
    const tbrBooks = library.filter(b => b.status === 'TBR');
    const finishedBooks = library.filter(b => b.status === 'Finished');

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════
    return (
        <Layout>
            <div className="library-container">

                {/* ── Search Bar ─────────────────────────────────────── */}
                <motion.div
                    className="search-section"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="search-bar-wrapper">
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                className="book-search-input"
                                placeholder="Search by title, author, or ISBN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="search-btn"><Search size={16} /> Discover</button>
                        </form>
                    </div>
                </motion.div>

                {/* ── Search Results Overlay ──────────────────────────── */}
                <AnimatePresence>
                    {isSearching && (
                        <motion.div
                            className="library-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="section-header">
                                <h2 className="section-title">Search Results</h2>
                                <button onClick={closeSearch} style={{ background: 'none', border: 'none', color: '#8b7e72', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                                    Close <X size={18} />
                                </button>
                            </div>
                            <div className="books-grid">
                                {searchResults.map(item => (
                                    <motion.div
                                        key={item.id}
                                        className="book-card"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="card-cover-container">
                                            <img
                                                src={item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=No+Cover'}
                                                className="card-cover"
                                                alt={item.volumeInfo.title}
                                            />
                                        </div>
                                        <div className="card-content">
                                            <h3 className="card-title">{item.volumeInfo.title}</h3>
                                            <p className="card-author">{item.volumeInfo.authors?.[0]}</p>
                                            <button
                                                className="search-btn"
                                                style={{ width: '100%', position: 'static', marginTop: 'auto', borderRadius: '10px' }}
                                                onClick={() => addToLibrary(item, 'Reading')}
                                            >
                                                Start Reading
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════════════════════ */}
                {/* MAIN SHELF LAYOUT                                      */}
                {/* ═══════════════════════════════════════════════════════ */}
                {!isSearching && (
                    <>
                        {/* ── Currently Reading Shelf ────────────────────── */}
                        <motion.div
                            className="shelf-section"
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div
                                className="currently-reading-shelf"
                                variants={shelfContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {readingBooks.map((book, idx) => (
                                    <motion.div
                                        key={book._id}
                                        className={`shelf-book ${idx === 0 ? 'featured' : 'secondary'}`}
                                        variants={bookItem}
                                        whileHover={{ scale: 1.06, rotate: -1, transition: { duration: 0.25 } }}
                                        onClick={() => { setSelectedBook(book); setActiveTab('progress'); }}
                                    >
                                        <span className="progress-badge">
                                            {getPercent(book.currentPage, book.pageCount)}%
                                        </span>
                                        <img
                                            src={book.thumbnail}
                                            className="shelf-book-cover"
                                            alt={book.title}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>

                            {readingBooks.length === 0 && (
                                <p className="empty-shelf-message">No books being read. Search above to begin a journey.</p>
                            )}

                            <div className="shelf-ledge" />
                        </motion.div>

                        {/* ── Recently Browsed Stack ──────────────────────── */}
                        {readingBooks.length > 1 && (
                            <motion.div
                                className="shelf-section"
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.2 }}
                            >
                                <motion.div
                                    className="browsed-stack-section"
                                    variants={shelfContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {readingBooks.slice(1).map((book, idx) => (
                                        <motion.div
                                            key={book._id}
                                            className="stack-book"
                                            variants={bookItem}
                                            style={{ transform: `rotate(${(idx % 2 === 0 ? -3 : 4) + idx}deg)` }}
                                            whileHover={{ scale: 1.1, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
                                            onClick={() => { setSelectedBook(book); setActiveTab('progress'); }}
                                        >
                                            {book.notes && book.notes.length > 0 && idx === 0 && (
                                                <span className="note-pill">New Note</span>
                                            )}
                                            <span className="progress-badge">
                                                {getPercent(book.currentPage, book.pageCount)}%
                                            </span>
                                            <img
                                                src={book.thumbnail}
                                                className="stack-book-cover"
                                                alt={book.title}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                                <div className="shelf-ledge" />
                            </motion.div>
                        )}

                        {/* ── To Be Read Drawer ──────────────────────────── */}
                        <motion.div
                            className="tbr-drawer"
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <div className="tbr-header">
                                <div className="tbr-title">
                                    <span className="tbr-title-icon">📚</span>
                                    <span>To Be Read Drawer</span>
                                </div>
                                <div className="tbr-filters">
                                    {['Ours', 'His', 'Hers'].map(f => (
                                        <button
                                            key={f}
                                            className={`tbr-filter-pill ${tbrFilter === f ? 'active' : ''}`}
                                            onClick={() => setTbrFilter(f)}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                className="tbr-scroll"
                                variants={shelfContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {tbrBooks.map(book => (
                                    <motion.div
                                        key={book._id}
                                        className="tbr-book"
                                        variants={bookItem}
                                        whileHover={{ scale: 1.08, y: -6, transition: { duration: 0.2 } }}
                                        onClick={() => { setSelectedBook(book); setActiveTab('progress'); }}
                                    >
                                        <img
                                            src={book.thumbnail}
                                            className="tbr-book-cover"
                                            alt={book.title}
                                        />
                                    </motion.div>
                                ))}

                                {/* Add Book Card */}
                                <motion.button
                                    className="tbr-add-card"
                                    variants={bookItem}
                                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                    onClick={() => {
                                        document.querySelector('.book-search-input')?.focus();
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    <span className="tbr-add-icon">+</span>
                                    <span>Add Book</span>
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* ── Finished Section ────────────────────────────── */}
                        {finishedBooks.length > 0 && (
                            <motion.div
                                className="shelf-section"
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.4 }}
                            >
                                <motion.div
                                    className="finished-section"
                                    variants={shelfContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {finishedBooks.map(book => (
                                        <motion.div
                                            key={book._id}
                                            className="finished-book"
                                            variants={bookItem}
                                            whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.25 } }}
                                            onClick={() => { setSelectedBook(book); setActiveTab('progress'); }}
                                        >
                                            <div className="finished-book-card">
                                                <img
                                                    src={book.thumbnail}
                                                    className="finished-book-cover"
                                                    alt={book.title}
                                                />
                                                <div className="finished-overlay">
                                                    <span className="finished-book-title">{book.title}</span>
                                                    <div className="finished-check">
                                                        <Check size={16} />
                                                    </div>
                                                    <span className="finished-label">Finished</span>
                                                    <span className="finished-author">{book.authors?.[0]}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                                <div className="shelf-ledge" />
                            </motion.div>
                        )}
                    </>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* DETAIL MODAL                                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {selectedBook && (
                        <motion.div
                            className="modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => { setSelectedBook(null); setSuggestions([]); setEditingChar(null); }}
                        >
                            <motion.div
                                className="detail-modal"
                                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 30 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* LEFT SIDEBAR */}
                                <div className="modal-left">
                                    <img src={selectedBook.thumbnail} className="modal-cover" alt={selectedBook.title} />
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedBook.title}</h2>
                                    <p style={{ color: '#8b7e72', fontWeight: 'bold' }}>by {selectedBook.authors[0]}</p>

                                    <div className="modal-stats">
                                        <div className="stat-badge">
                                            <Users size={14} />
                                            <span>{selectedBook.characters?.length || 0} Characters</span>
                                        </div>
                                        <div className="stat-badge">
                                            <FileText size={14} />
                                            <span>{selectedBook.notes?.length || 0} Notes</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                        <button className="btn-icon"><Bell size={20} /></button>
                                        <button className="btn-icon"><Moon size={20} /></button>
                                        <button className="btn-icon" onClick={() => alert('Settings')}><Settings size={20} /></button>
                                    </div>
                                </div>

                                {/* RIGHT CONTENT */}
                                <div className="modal-right">

                                    {/* TAB NAVIGATION */}
                                    <div className="modal-tabs">
                                        <button
                                            className={`modal-tab ${activeTab === 'progress' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('progress')}
                                        >
                                            <BookOpen size={16} /> Progress
                                        </button>
                                        <button
                                            className={`modal-tab ${activeTab === 'characters' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('characters')}
                                        >
                                            <Users size={16} /> Characters
                                        </button>
                                        <button
                                            className={`modal-tab ${activeTab === 'notes' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('notes')}
                                        >
                                            <MessageSquare size={16} /> Notes & Quotes
                                        </button>
                                    </div>

                                    {/* ─── PROGRESS TAB ─── */}
                                    {activeTab === 'progress' && (
                                        <div className="tab-content">
                                            <div className="progress-card">
                                                <h3>Reading Progress</h3>
                                                {selectedBook.pageCount === 0 || selectedBook.pageCount === 100 ? (
                                                    <div style={{ background: 'rgba(255,255,100,0.2)', color: '#D97706', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <AlertTriangle size={16} /> Page count missing. Please set it below.
                                                    </div>
                                                ) : null}
                                                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Last updated recently</p>
                                                <div className="slider-container">
                                                    <input type="range" min="0" max={selectedBook.pageCount || 500}
                                                        value={selectedBook.currentPage} className="page-slider"
                                                        onChange={(e) => updateProgress(selectedBook, parseInt(e.target.value))}
                                                    />
                                                    <div style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>
                                                        <span style={{ background: '#E8733A', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'white' }}>
                                                            {getPercent(selectedBook.currentPage, selectedBook.pageCount)}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
                                                        Page {selectedBook.currentPage}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{selectedBook.pageCount - selectedBook.currentPage} pages left</span>
                                                    <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                                                        const total = prompt("Set total pages:", selectedBook.pageCount);
                                                        if (total && !isNaN(total)) updateProgress(selectedBook, selectedBook.currentPage, parseInt(total));
                                                    }}>
                                                        Total {selectedBook.pageCount} <Edit2 size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── CHARACTERS TAB ─── */}
                                    {activeTab === 'characters' && (
                                        <div className="tab-content">
                                            <div className="tab-actions">
                                                <button className="ai-suggest-btn" onClick={suggestCharacters} disabled={isSuggesting}>
                                                    <Sparkles size={16} className={isSuggesting ? 'sparkle-spin' : ''} />
                                                    {isSuggesting ? 'Analyzing...' : 'AI Suggest Characters'}
                                                </button>
                                                <button className="add-btn" onClick={() => setShowAddChar(!showAddChar)}>
                                                    <Plus size={16} /> Add Manually
                                                </button>
                                            </div>

                                            {/* AI Suggestions */}
                                            {suggestions.length > 0 && (
                                                <div className="suggestions-section">
                                                    <h4 className="suggestions-title">
                                                        <Sparkles size={14} /> AI Suggestions
                                                    </h4>
                                                    <div className="suggestions-grid">
                                                        {suggestions.map((s, i) => (
                                                            <div key={i} className="suggestion-card">
                                                                <span className="suggestion-name">{s.name}</span>
                                                                <div className="suggestion-actions">
                                                                    <button className="suggestion-accept" onClick={() => addCharacterFromSuggestion(s)}>
                                                                        <Plus size={14} /> Add
                                                                    </button>
                                                                    <button className="suggestion-dismiss" onClick={() => setSuggestions(prev => prev.filter((_, idx) => idx !== i))}>
                                                                        <X size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add Character Form */}
                                            {showAddChar && (
                                                <div className="add-form glass-form">
                                                    <h4>New Character</h4>
                                                    <input
                                                        type="text" placeholder="Character name"
                                                        className="form-input"
                                                        value={newChar.name}
                                                        onChange={e => setNewChar(p => ({ ...p, name: e.target.value }))}
                                                    />
                                                    <select className="form-input" value={newChar.role}
                                                        onChange={e => setNewChar(p => ({ ...p, role: e.target.value }))}>
                                                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    <textarea
                                                        placeholder="Description (who is this character?)"
                                                        className="form-input form-textarea"
                                                        value={newChar.description}
                                                        onChange={e => setNewChar(p => ({ ...p, description: e.target.value }))}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="add-btn" onClick={addCharacter}>Save Character</button>
                                                        <button className="cancel-btn" onClick={() => setShowAddChar(false)}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Character Cards */}
                                            <div className="characters-grid">
                                                {(selectedBook.characters || []).map(char => (
                                                    <div key={char._id} className="character-card">
                                                        {editingChar === char._id ? (
                                                            <div className="char-edit-form">
                                                                <input type="text" className="form-input" defaultValue={char.name}
                                                                    id={`edit-name-${char._id}`} />
                                                                <select className="form-input" defaultValue={char.role}
                                                                    id={`edit-role-${char._id}`}>
                                                                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                                                </select>
                                                                <textarea className="form-input form-textarea" defaultValue={char.description}
                                                                    id={`edit-desc-${char._id}`} />
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    <button className="add-btn" onClick={() => {
                                                                        updateCharacter(char._id, {
                                                                            name: document.getElementById(`edit-name-${char._id}`).value,
                                                                            role: document.getElementById(`edit-role-${char._id}`).value,
                                                                            description: document.getElementById(`edit-desc-${char._id}`).value,
                                                                        });
                                                                    }}>Save</button>
                                                                    <button className="cancel-btn" onClick={() => setEditingChar(null)}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="char-header">
                                                                    <div className="char-avatar-icon">
                                                                        <User size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="char-name">{char.name}</h4>
                                                                        <span className="char-role-badge" style={{ background: roleColors[char.role] || '#64748B' }}>
                                                                            {char.role || 'Unknown'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {char.description && (
                                                                    <p className="char-description">{char.description}</p>
                                                                )}
                                                                <div className="char-actions">
                                                                    <button onClick={() => setEditingChar(char._id)} title="Edit">
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button onClick={() => deleteCharacter(char._id)} title="Delete">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {(!selectedBook.characters || selectedBook.characters.length === 0) && !showAddChar && (
                                                <div className="empty-state">
                                                    <Users size={48} strokeWidth={1} />
                                                    <p>No characters yet. Add them manually or let AI suggest from the book's description.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ─── NOTES & QUOTES TAB ─── */}
                                    {activeTab === 'notes' && (
                                        <div className="tab-content">
                                            <div className="tab-actions">
                                                <button className="add-btn" onClick={() => setShowAddNote(!showAddNote)}>
                                                    <Plus size={16} /> Add Note
                                                </button>
                                                {(selectedBook.characters?.length > 0) && (
                                                    <p className="mention-hint">
                                                        Type <span className="mention-at">@</span> to reference a character
                                                    </p>
                                                )}
                                            </div>

                                            {/* Add Note Form */}
                                            {showAddNote && (
                                                <div className="add-form glass-form" style={{ position: 'relative' }}>
                                                    <h4>New Note</h4>
                                                    <div className="note-type-selector">
                                                        {['note', 'quote', 'thought'].map(t => (
                                                            <button key={t}
                                                                className={`type-btn ${newNote.type === t ? 'active' : ''}`}
                                                                onClick={() => setNewNote(p => ({ ...p, type: t }))}
                                                            >
                                                                {t === 'note' && <FileText size={14} />}
                                                                {t === 'quote' && <Quote size={14} />}
                                                                {t === 'thought' && <MessageSquare size={14} />}
                                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea
                                                        ref={noteInputRef}
                                                        placeholder={`Write your ${newNote.type}... Use @name to mention a character`}
                                                        className="form-input form-textarea note-textarea"
                                                        value={newNote.content}
                                                        onChange={handleNoteInput}
                                                    />
                                                    {mentionState.active && selectedBook.characters?.length > 0 && (
                                                        <MentionDropdown
                                                            characters={selectedBook.characters}
                                                            filter={mentionState.filter}
                                                            onSelect={insertMention}
                                                            position={mentionState.position}
                                                        />
                                                    )}
                                                    <input
                                                        type="number" placeholder="Page number (optional)"
                                                        className="form-input"
                                                        value={newNote.page}
                                                        onChange={e => setNewNote(p => ({ ...p, page: e.target.value }))}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="add-btn" onClick={addNote}>Save Note</button>
                                                        <button className="cancel-btn" onClick={() => setShowAddNote(false)}>Cancel</button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notes List */}
                                            <div className="notes-list">
                                                {(selectedBook.notes || []).slice().reverse().map(note => (
                                                    <div key={note._id} className={`note-card note-type-${note.type}`}>
                                                        <div className="note-header">
                                                            <div className="note-type-badge">
                                                                {note.type === 'quote' && <Quote size={14} />}
                                                                {note.type === 'note' && <FileText size={14} />}
                                                                {note.type === 'thought' && <MessageSquare size={14} />}
                                                                {note.type}
                                                            </div>
                                                            <button className="note-delete" onClick={() => deleteNote(note._id)}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        <NoteContent
                                                            content={note.content}
                                                            characters={selectedBook.characters || []}
                                                        />
                                                        <div className="note-footer">
                                                            {note.page && <span className="note-page">PAGE {note.page}</span>}
                                                            <span className="note-date">
                                                                {new Date(note.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {(!selectedBook.notes || selectedBook.notes.length === 0) && !showAddNote && (
                                                <div className="empty-state">
                                                    <FileText size={48} strokeWidth={1} />
                                                    <p>No notes yet. Start capturing your thoughts, favorite quotes, and reflections.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </Layout>
    );
};

export default BookLibrary;
