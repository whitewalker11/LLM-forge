from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class RAGEngine:

    def __init__(self):
        self.vectorstore = None

    def build_from_text(self, text: str):

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

        docs = splitter.split_documents([Document(page_content=text)])

        embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )

        self.vectorstore = FAISS.from_documents(docs, embeddings)

    def get_context(self, query: str, top_k=3):

        if not self.vectorstore:
            return None

        docs = self.vectorstore.similarity_search(query, k=top_k)
        return "\n".join([d.page_content for d in docs])