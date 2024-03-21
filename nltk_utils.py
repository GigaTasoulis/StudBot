import spacy
import numpy as np
from unidecode import unidecode

nlp = spacy.load("el_core_news_lg")

def tokenize(sentence):
    """Tokenize a sentence using Spacy and convert to lowercase without accents."""
    doc = nlp(sentence)
    return [unidecode(token.text).lower() for token in doc]

def stemming(word):
    """Return the root form of a word using Spacy's lemmatization."""
    doc = nlp(word)
    return doc[0].lemma_.lower()

def bag_of_words(tokenized_sentence, all_words):
    """
    Return bag of words array:
    1 for each known word that exists in the sentence, 0 otherwise.
    """
    tokenized_sentence = [stemming(w) for w in tokenized_sentence]
    bag = np.zeros(len(all_words), dtype=np.float32)
    for idx, w in enumerate(all_words):
        w_stemmed = stemming(w)
        if w_stemmed in tokenized_sentence:
            bag[idx] = 1.0
    
    return bag

# sentence = ["γεια", "πως", "εισαι", ";"]
# words = ["Γεια", "πως", "είσαι", "εσυ", "αντιο", "ευχαριστω", "οκ"]
# bag = bag_of_words(sentence, words)
# print(bag)
