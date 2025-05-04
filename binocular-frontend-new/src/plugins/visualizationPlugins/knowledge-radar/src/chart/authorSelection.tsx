import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles.module.scss';
import { colorScheme } from './colorScheme.ts';
import { AuthorType } from "../../../../../types/data/authorType.ts";

interface AuthorSelectionProps {
  authorList: AuthorType[];
  selectedAuthor: AuthorType | null;
  onAuthorSelect: (author: AuthorType) => void;
  containerWidth?: number;
}

const AuthorSelection: React.FC<AuthorSelectionProps> = ({
                                                           authorList,
                                                           selectedAuthor,
                                                           onAuthorSelect,
                                                           containerWidth = 500
                                                         }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredAuthors, setFilteredAuthors] = useState<AuthorType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedAuthors = authorList.filter(author => author.selected);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAuthors(selectedAuthors);
    } else {
      const filtered = selectedAuthors.filter(author =>
        (author.displayName || author.user.gitSignature)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredAuthors(filtered);
    }
  }, [searchTerm, authorList]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleDropdown = (): void => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSelectAuthor = (author: AuthorType): void => {
    onAuthorSelect(author);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getAuthorDisplayName = (author: AuthorType): string => {
    return author.displayName || author.user.gitSignature;
  };

  const getFontSize = () => {
    return `${Math.max(0.75, Math.min(0.9, containerWidth / 600))}em`;
  };

  const getDotSize = () => {
    return `${Math.max(0.4, Math.min(0.8, containerWidth / 700))}em`;
  };

  const getPadding = () => {
    return `${Math.max(0.25, Math.min(0.6, containerWidth / 600))}em`;
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.authorSelector || ""}`}
      style={{
        width: '70%',
        margin: '0 auto',
        fontSize: getFontSize(),
        position: 'relative'
      }}
    >
      <div
        ref={dropdownRef}
        className={`${styles.authorSelectorToggle || ""}`}
        onClick={handleToggleDropdown}
        style={{
          backgroundColor: colorScheme.background,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isOpen ? colorScheme.primary : colorScheme.grid,
          boxShadow: isOpen ? `0 0 0 2px ${colorScheme.primary}20` : 'none',
          color: colorScheme.text,
          padding: getPadding(),
          borderRadius: '0.375em',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.3s ease-in-out',
          width: '100%'
        }}
      >
        {selectedAuthor ? (
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div
              style={{
                width: getDotSize(),
                height: getDotSize(),
                borderRadius: '50%',
                marginRight: '0.75em',
                backgroundColor: selectedAuthor.color.main,
                transform: isOpen ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.3s ease-in-out'
              }}
            />
            <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getAuthorDisplayName(selectedAuthor)}
            </span>
          </div>
        ) : (
          <span style={{ color: 'gray' }}>Select an author</span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <svg
            style={{
              width: getDotSize(),
              height: getDotSize(),
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease-in-out'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            top: '100%',
            left: 0,
            marginTop: '0.25em',
            borderRadius: '0.375em',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            backgroundColor: colorScheme.background,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colorScheme.grid,
            animation: 'dropdownFadeIn 0.2s ease-out forwards'
          }}
        >
          <div style={{ padding: getPadding(), backgroundColor: colorScheme.background }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: getPadding(),
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: colorScheme.grid,
                borderRadius: '0.375em',
                color: colorScheme.text,
                backgroundColor: colorScheme.background,
                fontSize: '1em',
                outline: 'none'
              }}
            />
          </div>
          <div style={{
            maxHeight: '180px', // Reduced height
            overflowY: 'auto',
            backgroundColor: colorScheme.background
          }}>
            {filteredAuthors.length > 0 ? (
              filteredAuthors.map((author) => (
                <div
                  key={author.id}
                  onClick={() => {handleSelectAuthor(author)}}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: getPadding(),
                    cursor: 'pointer',
                    backgroundColor: selectedAuthor && selectedAuthor.id === author.id
                      ? `${author.color.main}10`
                      : colorScheme.background,
                    borderLeftWidth: '3px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: selectedAuthor && selectedAuthor.id === author.id
                      ? author.color.main
                      : 'transparent',
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${author.color.main}10`;
                  }}
                  onMouseLeave={(e) => {
                    if (!(selectedAuthor && selectedAuthor.id === author.id)) {
                      e.currentTarget.style.backgroundColor = colorScheme.background;
                    }
                  }}
                >
                  <div
                    style={{
                      width: getDotSize(),
                      height: getDotSize(),
                      borderRadius: '50%',
                      marginRight: '0.75em',
                      backgroundColor: author.color.main
                    }}
                  />
                  <span style={{
                    color: colorScheme.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {getAuthorDisplayName(author)}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                padding: getPadding(),
                textAlign: 'center',
                color: colorScheme.text
              }}>
                No authors found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorSelection;
