import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import DocumentCard from '../components/DocumentCard';

const DOCS_PER_PAGE = 9;

const Browse = () => {
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('all');
  const [subject, setSubject] = useState('all');
  const [sort, setSort] = useState('newest');

  const fetchDocuments = useCallback(async (pg = page) => {
    setLoading(true);
    try {
      const params = {
        semester,
        subject,
        sort,
        page: pg,
        limit: DOCS_PER_PAGE
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await api.get('/documents', { params });

      setDocuments(res.data.documents || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Browse fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, semester, subject, sort, page]);

  useEffect(() => {
    fetchDocuments(1);
    setPage(1);
  }, [semester, subject, sort]);

  useEffect(() => {
    fetchDocuments(page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchDocuments(1);
  };

  const totalPages = Math.ceil(total / DOCS_PER_PAGE);

  return (
    <>
      {/* Header */}
      <section className="browse-header">
        <div className="container">
          <h2>Browse Documents</h2>

          <div className="search-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
            </div>

            <div className="filters">
              <div className="filter-group">
                <label>Semester:</label>
                <select value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="all">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Subject:</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}>
                  <option value="all">All Subjects</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="programming">Programming</option>
                  <option value="electronics">Electronics</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="electrical">Electrical</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="civil">Civil Engineering</option>
                  <option value="english">English</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sort By:</label>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="results-count">
            {loading
              ? "Loading..."
              : `Showing ${documents.length} of ${total} document${total !== 1 ? 's' : ''}`}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="documents-browse">
        <div className="container">
          <div className="documents-grid">
            {loading ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>
                Loading documents...
              </p>
            ) : documents.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>
                No documents found.
              </p>
            ) : (
              documents.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  className={page === pg ? "active" : ""}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Browse;