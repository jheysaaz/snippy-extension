import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Modal from "./Modal";
import type { SnippetFormData } from "../types";

interface AddSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (snippet: SnippetFormData) => void;
  initialData?: SnippetFormData;
  title?: string;
  submitText?: string;
}

export default function AddSnippetModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = "Add New Snippet",
  submitText = "Add Snippet",
}: AddSnippetModalProps) {
  const [formData, setFormData] = useState<SnippetFormData>(
    initialData || {
      label: "",
      shortcut: "",
      content: "",
      tags: [],
    }
  );

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validate shortcut - no spaces allowed
    if (name === "shortcut" && value.includes(" ")) {
      setErrors({ ...errors, shortcut: "Shortcut cannot contain spaces" });
      return;
    } else if (name === "shortcut") {
      setErrors({ ...errors, shortcut: "" });
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.label.trim()) newErrors.label = "Label is required";
    if (!formData.shortcut.trim()) newErrors.shortcut = "Shortcut is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (formData.shortcut.includes(" "))
      newErrors.shortcut = "Shortcut cannot contain spaces";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      label: "",
      shortcut: "",
      content: "",
      tags: [],
    });
    setTagInput("");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Label */}
        <div>
          <label
            htmlFor="label"
            className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
          >
            Label <span className="text-red-500">*</span>
          </label>
          <input
            id="label"
            name="label"
            type="text"
            value={formData.label}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            placeholder="Enter snippet label"
          />
          {errors.label && (
            <p className="text-red-500 text-xs mt-1">{errors.label}</p>
          )}
        </div>

        {/* Shortcut */}
        <div>
          <label
            htmlFor="shortcut"
            className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
          >
            Shortcut <span className="text-red-500">*</span>
          </label>
          <input
            id="shortcut"
            name="shortcut"
            type="text"
            value={formData.shortcut}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            placeholder="e.g., !forEach, !map"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            No spaces allowed
          </p>
          {errors.shortcut && (
            <p className="text-red-500 text-xs mt-1">{errors.shortcut}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
          >
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 font-mono text-sm"
            placeholder="Enter your code snippet here..."
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
          >
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors"
          >
            {submitText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
